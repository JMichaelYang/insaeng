export function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-primary">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}
