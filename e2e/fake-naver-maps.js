// A stand-in for the NAVER Maps JS SDK, served instead of oapi.map.naver.com in e2e tests.
// It implements only what the app uses, renders markers and info windows as DOM so tests can
// assert on what the player sees, answers reverse geocoding with a fixed region, and reproduces
// the SDK behaviours the app works around: forcing `position: relative`, setSize() pinning
// inline pixels, and clearing naver.maps after an authentication failure.
(() => {
  const listeners = new Map();
  const Event = {
    addListener(target, name, handler) {
      const listener = { target, name, handler };
      if (!listeners.has(target)) listeners.set(target, []);
      listeners.get(target).push(listener);
      return listener;
    },
    removeListener(listenerOrList) {
      const toRemove = Array.isArray(listenerOrList) ? listenerOrList : [listenerOrList];
      for (const listener of toRemove) {
        const list = listeners.get(listener.target) ?? [];
        const index = list.indexOf(listener);
        if (index >= 0) list.splice(index, 1);
      }
    },
    trigger(target, name, event) {
      // Copy first: a handler may remove listeners while we iterate.
      for (const listener of (listeners.get(target) ?? []).slice()) {
        if (listener.name === name) listener.handler(event);
      }
    },
  };

  class LatLng {
    #lat;
    #lng;
    constructor(lat, lng) {
      this.#lat = lat;
      this.#lng = lng;
    }
    lat() {
      return this.#lat;
    }
    lng() {
      return this.#lng;
    }
  }
  class LatLngBounds {
    constructor(southWest, northEast) {
      this.southWest = southWest;
      this.northEast = northEast;
    }
    hasLatLng(point) {
      return (
        point.lat() >= this.southWest.lat() &&
        point.lat() <= this.northEast.lat() &&
        point.lng() >= this.southWest.lng() &&
        point.lng() <= this.northEast.lng()
      );
    }
  }
  class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }
  class Size {
    constructor(width, height) {
      this.width = width;
      this.height = height;
    }
  }

  const maps = [];

  class NaverMap {
    constructor(element, options) {
      this.element = element;
      this.center = options.center;
      this.zoom = options.zoom;
      this.destroyed = false;
      element.style.position = "relative";
      this.layer = document.createElement("div");
      this.layer.dataset.testid = "fake-map-layer";
      this.layer.style.display = "contents";
      element.append(this.layer);
      maps.push(this);
    }
    getElement() {
      return this.element;
    }
    getZoom() {
      return this.zoom;
    }
    setZoom(zoom) {
      this.zoom = Math.max(6, Math.min(19, zoom));
      Event.trigger(this, "zoom_changed");
      Event.trigger(this, "idle");
    }
    morph(center, zoom) {
      this.center = center;
      this.setZoom(zoom);
    }
    setCenter(center) {
      this.center = center;
      Event.trigger(this, "idle");
    }
    getCenter() {
      return this.center;
    }
    // A flat projection is enough for the app's pixel-distance checks.
    pixelsPerDegree() {
      return (256 * 2 ** this.zoom) / 360;
    }
    getProjection() {
      const scale = this.pixelsPerDegree();
      return {
        fromCoordToOffset: (coord) => new Point(coord.lng() * scale, -coord.lat() * scale),
        fromOffsetToCoord: (offset) => new LatLng(-offset.y / scale, offset.x / scale),
      };
    }
    getBounds() {
      const scale = this.pixelsPerDegree();
      const { width = 800, height = 600 } = this.size ?? {};
      const halfLng = width / 2 / scale;
      const halfLat = height / 2 / scale;
      return new LatLngBounds(
        new LatLng(this.center.lat() - halfLat, this.center.lng() - halfLng),
        new LatLng(this.center.lat() + halfLat, this.center.lng() + halfLng),
      );
    }
    fitBounds(points, options) {
      const lat = points.reduce((sum, point) => sum + point.lat(), 0) / points.length;
      const lng = points.reduce((sum, point) => sum + point.lng(), 0) / points.length;
      this.center = new LatLng(lat, lng);
      this.setZoom(options?.maxZoom ?? 12);
    }
    setSize(size) {
      this.size = size;
      this.element.style.width = `${size.width}px`;
      this.element.style.height = `${size.height}px`;
    }
    destroy() {
      this.destroyed = true;
      this.layer.remove();
    }
  }

  class Overlay {
    setMap(map) {
      if (map?.destroyed) throw new Error("map destroyed");
      this.map = map;
      this.render();
    }
    getMap() {
      return this.map ?? null;
    }
    render() {}
  }
  class Polygon extends Overlay {
    constructor(options) {
      super();
      this.setMap(options.map);
    }
  }
  class Polyline extends Overlay {
    constructor(options) {
      super();
      this.setMap(options.map);
    }
  }
  class Marker extends Overlay {
    constructor(options) {
      super();
      this.options = options;
      this.visible = true;
      this.element = document.createElement("div");
      this.element.dataset.testid = "fake-marker";
      this.element.innerHTML = options.icon?.content ?? "";
      this.element.addEventListener("click", () => Event.trigger(this, "click"));
      this.setMap(options.map);
    }
    setVisible(visible) {
      this.visible = visible;
      this.element.hidden = !visible;
    }
    getVisible() {
      return this.visible;
    }
    render() {
      if (this.map) this.map.layer.append(this.element);
      else this.element.remove();
    }
  }
  class InfoWindow extends Overlay {
    constructor(options) {
      super();
      this.content = options.content;
    }
    open(map) {
      this.map = map;
      map.layer.append(this.content);
    }
    close() {
      this.map = null;
      this.content.remove();
    }
  }

  // Every point geocodes to the same region, so tests know what to expect.
  const REGION = ["서울특별시", "중구", "명동", ""];
  let geocodeCount = 0;
  const Service = {
    Status: { OK: 200, ERROR: 500 },
    reverseGeocode(_options, callback) {
      geocodeCount++;
      const region = Object.fromEntries(
        REGION.map((name, index) => [`area${index + 1}`, { name }]),
      );
      setTimeout(() => callback(Service.Status.OK, { v2: { results: [{ region }] } }));
    },
  };

  window.naver = {
    maps: {
      Map: NaverMap,
      LatLng,
      LatLngBounds,
      Point,
      Size,
      Polygon,
      Polyline,
      Marker,
      InfoWindow,
      Event,
      Service,
      Position: { BOTTOM_LEFT: 1, BOTTOM_RIGHT: 2 },
    },
  };

  // Test controls, driven through page.evaluate().
  const liveMap = () => maps.find((map) => !map.destroyed && map.element.isConnected);
  window.fakeNaverMaps = {
    zoom: () => liveMap().zoom,
    zoomTo: (zoom) => liveMap().setZoom(zoom),
    panTo: (lat, lng) => liveMap().setCenter(new LatLng(lat, lng)),
    geocodeCount: () => geocodeCount,
    click: (lat, lng) => Event.trigger(liveMap(), "click", { coord: new LatLng(lat, lng) }),
    failAuthentication: () => {
      const notify = window.navermap_authFailure;
      window.naver.maps = null;
      notify?.();
    },
  };
})();
