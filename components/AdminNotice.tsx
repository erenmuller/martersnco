export default function AdminNotice({
  notice,
  error,
}: {
  notice?: string | string[];
  error?: string | string[];
}) {
  const errorText = Array.isArray(error) ? error[0] : error;
  const noticeText = Array.isArray(notice) ? notice[0] : notice;
  const text = errorText ?? noticeText;
  if (!text) return null;

  return (
    <p
      className={`notice ${errorText ? "notice-error" : "notice-ok"}`}
      role={errorText ? "alert" : "status"}
    >
      {text}
    </p>
  );
}
