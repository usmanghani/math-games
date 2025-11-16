import { AppHero } from "@/components/AppHero";
import { Playground } from "@/components/Playground";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:px-12">
      <AppHero />
      <Playground />
    </main>
  );
}
