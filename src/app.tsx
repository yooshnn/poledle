import { useRoute } from "@/lib/router";
import { DailyPage } from "@/pages/daily-page";

export function App() {
  const route = useRoute();
  switch (route) {
    case "/":
      return <DailyPage />;
  }
}
