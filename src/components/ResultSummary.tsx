export default function ResultSummary({ score, summary }: { score: number; summary: string }) {
  return (
    <div>
      <h2>Score: {score}</h2>
      <p>{summary}</p>
    </div>
  );
}
