import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { FC } from "react";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { ExcelContextButton } from "@/components/assistant-ui/excel-context-button";

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root"
      style={{
        ["--thread-max-width" as string]: "100%",
      }}
    >
      <ThreadPrimitive.Viewport className="aui-thread-viewport">
        <ThreadWelcome />

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            EditComposer: EditComposer,
            AssistantMessage: AssistantMessage,
          }}
        />

        <ThreadPrimitive.If empty={false}>
          <div className="aui-thread-viewport-spacer" />
        </ThreadPrimitive.If>

        <div className="aui-thread-viewport-footer">
          <ThreadScrollToBottom />
          <Composer />
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="aui-thread-welcome-root">
        <div className="aui-thread-welcome-center">
          <p className="aui-thread-welcome-message">How can I help you today?</p>
        </div>
        <ThreadWelcomeSuggestions />
      </div>
    </ThreadPrimitive.Empty>
  );
};

const ThreadWelcomeSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions">
      <ThreadPrimitive.Suggestion
        className="aui-thread-welcome-suggestion"
        prompt="Analyze my selected data"
        method="replace"
        autoSend
      >
        <span className="aui-thread-welcome-suggestion-text">
          Analyze my selected data
        </span>
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        className="aui-thread-welcome-suggestion"
        prompt="Help with Excel formulas"
        method="replace"
        autoSend
      >
        <span className="aui-thread-welcome-suggestion-text">
          Help with Excel formulas
        </span>
      </ThreadPrimitive.Suggestion>
    </div>
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="aui-composer-root">
      {/* Upper section: Text input */}
      <div className="aui-composer-input-section">
        <ComposerPrimitive.Input
          rows={1}
          autoFocus
          placeholder="Write a message..."
          className="aui-composer-input"
        />
      </div>
      
      {/* Lower section: Button area */}
      <div className="aui-composer-button-section">
        <ComposerAction />
      </div>
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC = () => {
  return (
    <>
      {/* Left side: Excel Context Button */}
      <div className="aui-composer-button-left">
        <ExcelContextButton />
      </div>
      
      {/* Right side: Submit/Cancel button */}
      <div className="aui-composer-button-right">
        <ThreadPrimitive.If running={false}>
          <ComposerPrimitive.Send asChild>
            <TooltipIconButton
              tooltip="Send"
              variant="default"
              className="aui-composer-send"
            >
              <SendHorizontalIcon />
            </TooltipIconButton>
          </ComposerPrimitive.Send>
        </ThreadPrimitive.If>
        <ThreadPrimitive.If running>
          <ComposerPrimitive.Cancel asChild>
            <TooltipIconButton
              tooltip="Cancel"
              variant="default"
              className="aui-composer-cancel"
            >
              <CircleStopIcon />
            </TooltipIconButton>
          </ComposerPrimitive.Cancel>
        </ThreadPrimitive.If>
      </div>
    </>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="aui-user-message-root">
      <UserActionBar />

      <div className="aui-user-message-content">
        <MessagePrimitive.Parts />
      </div>

      <BranchPicker className="aui-user-branch-picker" />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="aui-edit-composer-root">
      <ComposerPrimitive.Input className="aui-edit-composer-input" />

      <div className="aui-edit-composer-footer">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost">Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="aui-assistant-message-root">
      <div className="aui-assistant-message-content">
        <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
      </div>

      <AssistantActionBar />

      <BranchPicker className="aui-assistant-branch-picker" />
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn("aui-branch-picker-root", className)}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};
