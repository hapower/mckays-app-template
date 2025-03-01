/**
 * Chat Panel Component
 *
 * This component provides the layout and structure for the chat interface in the dashboard.
 * It serves as a container for the chat streamer, handling the overall layout and styling
 * while delegating the actual chat functionality to its children.
 *
 * The component provides a consistent UI container with header, content area for messages,
 * and a footer area for the input controls.
 *
 * @module components/dashboard/chat-panel
 */

"use client"

import { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Props for the ChatPanel component
 */
interface ChatPanelProps {
  /**
   * Title displayed in the panel header
   */
  title?: string

  /**
   * Content for the main message area
   * This should typically be the chat streamer component
   */
  children: ReactNode

  /**
   * Content for the input area at the bottom
   * This should typically be the message input component
   */
  footer?: ReactNode

  /**
   * Additional CSS class names to apply to the component
   */
  className?: string

  /**
   * Whether the panel is in a loading state
   */
  isLoading?: boolean
}

/**
 * Chat Panel component that provides the layout structure for the chat interface
 *
 * @example
 * ```tsx
 * <ChatPanel
 *   title="Chat with AI"
 *   footer={<MessageInput onSend={handleSendMessage} isLoading={false} />}
 * >
 *   <ChatMessages messages={messages} />
 * </ChatPanel>
 * ```
 */
export function ChatPanel({
  title = "Medical Assistant",
  children,
  footer,
  className,
  isLoading = false
}: ChatPanelProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden",
        isLoading && "opacity-80",
        className
      )}
    >
      {/* Panel header with title */}
      <CardHeader className="px-4 py-3 shadow-sm">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>

      {/* Main content area for messages */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="chat-scrollbar h-full overflow-y-auto p-4">
          {children}
        </div>
      </CardContent>

      {/* Footer area for message input */}
      {footer && (
        <CardFooter className="bg-card border-t p-4">{footer}</CardFooter>
      )}
    </Card>
  )
}
