import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { ViewIcon } from "lucide-react"
import { Button } from "./ui/button"
import { CodeBlock } from "./code-block"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable"

interface SQLPreviewProps {
  resourceData: {
    up: string
    down: string
  }
}

export function SQLPreview({ resourceData: { up, down } }: SQLPreviewProps) {
  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" aria-label="View SQL">
                <ViewIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Visualizar SQL</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Visualizar resultado</DialogTitle>
          <DialogDescription>
            Veja abaixo uma prévia do resultado
          </DialogDescription>
        </DialogHeader>
        <div className="h-[80vh] w-full justify-center flex gap-5">
          <ResizablePanelGroup className="w-full" direction="horizontal">
            <ResizablePanel className="w-[30vw]">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                SQL Up (Insert)
              </h3>
              <ScrollArea className="h-[98%] bg-[#282a36] rounded-md">
                <CodeBlock sql={up} />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </ResizablePanel>

            <ResizableHandle className="mx-2" />

            <ResizablePanel className="w-[30vw]">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                SQL Down (Rollback)
              </h3>
              <ScrollArea className="h-[98%] bg-[#282a36] rounded-md">
                <CodeBlock sql={down} />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </DialogContent>
    </Dialog>
  )
}
