import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(1);

  return (
    <div className="container">
      <p className="text">カウント数 {count}</p>
      <button
        className="button"
        type="button"
        onClick={() => setCount((count) => count + 1)}
      >
        カウント
      </button>
      <button
        className="button"
        type="button"
        onClick={() => {
          chrome.runtime.sendMessage({
            type: "count",
            id: count,
          });
        }}
      >
        取得する
      </button>
    </div>
  );
}
