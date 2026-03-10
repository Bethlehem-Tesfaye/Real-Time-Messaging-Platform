import { MessageCircle, Send } from "lucide-react";
import { colors } from "../../../config/theme";

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

const MessageInput = ({
  value,
  onChange,
  onSend,
  disabled,
}: MessageInputProps) => {
  return (
    <footer
      className="border-t px-4 py-3 sm:px-5 sm:py-4"
      style={{ borderColor: `${colors.secondary}20` }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3"
        style={{ borderColor: `${colors.secondary}24` }}
      >
        <MessageCircle
          className="h-4 w-4"
          style={{ color: colors.secondary }}
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="Write your message..."
          className="w-full bg-transparent text-sm outline-none xl:text-[0.95rem]"
          style={{ color: colors.primary }}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled}
          className="grid h-9 w-9 place-items-center rounded-xl text-white disabled:opacity-60"
          style={{ backgroundColor: colors.online }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
};

export default MessageInput;
