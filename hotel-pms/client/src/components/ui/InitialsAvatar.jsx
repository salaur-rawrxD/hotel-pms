import { UserAvatar } from "./avatar.jsx";

/** Default export for front-desk cards: initials from guest name. */
export default function InitialsAvatar({ name, className, size = "md" }) {
  return <UserAvatar name={name} className={className} size={size} />;
}
