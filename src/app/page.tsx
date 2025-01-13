import { ResourceForm } from "@/components/resource-form"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function Home() {
  return (
    <main className="flex flex-col gap-5 items-center justify-center my-5">
      <div className="flex gap-4 items-center flex-col sm:flex-row">
        <h1 className="text-4xl font-bold">Resource Maker</h1>

        <ThemeSwitcher />
      </div>

      <ResourceForm />
    </main>
  )
}
