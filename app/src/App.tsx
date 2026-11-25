import { useEffect, useState } from "react";
import { track } from "./lib/analytics";
import { TabBar } from "./components/ui";
import { useRoute } from "./lib/router";
import { getData, useData } from "./lib/store";
import { Home } from "./screens/Home";
import { Intake } from "./screens/Intake";
import { Onboarding } from "./screens/Onboarding";
import { Recap } from "./screens/Recap";
import { Result } from "./screens/Result";
import { Lock, Settings } from "./screens/Settings";
import { ShowDoctor } from "./screens/ShowDoctor";
import { Timeline } from "./screens/Timeline";

export function App() {
  const data = useData();
  const { path, params, visit } = useRoute();
  const [unlocked, setUnlocked] = useState(() => !getData().pin);

  // Screen path only (no query string: it holds record ids).
  useEffect(() => {
    track("screen_view", { screen: path });
  }, [path, visit]);

  if (data.pin && !unlocked)
    return (
      <main className="shell">
        <Lock onUnlock={() => setUnlocked(true)} />
      </main>
    );

  if (!data.profile)
    return (
      <main className="shell">
        <Onboarding />
      </main>
    );

  let screen;
  switch (path) {
    case "/intake":
      screen = <Intake />;
      break;
    case "/result":
      screen = <Result id={params.get("id") ?? ""} />;
      break;
    case "/recap":
      screen = <Recap episodeId={params.get("episode") ?? undefined} />;
      break;
    case "/timeline":
      screen = <Timeline />;
      break;
    case "/doctor":
      screen = <ShowDoctor />;
      break;
    case "/settings":
      screen = <Settings />;
      break;
    default:
      screen = <Home />;
  }
  const flow = path === "/intake" || path === "/recap";
  return (
    <>
      <main className="shell" key={visit}>{screen}</main>
      {!flow && <TabBar />}
    </>
  );
}
