import { useRoute } from "@/lib/router";
import { DailyPage } from "@/pages/daily-page";
import { InfinitePage } from "@/pages/infinite-page";
import { LessonPage } from "@/pages/lesson-page";

export function App() {
  const route = useRoute();
  switch (route) {
    case "/":
      return <DailyPage />;
    case "/infinite":
      return <InfinitePage />;
    case "/lesson":
      return <LessonPage />;
  }
}
