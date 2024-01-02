"use client";
import { useTestStore } from "@/store/test";
import { ChangeEvent, useState } from "react";

const Page = () => {
  const [text, setText] = useState("");
  const updateText = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const testStore = useTestStore();
  const set = () => {
    testStore.setToken(text);
  };
  const get = () => {
    alert(testStore.token);
  };
  return (
    <>
      <button onClick={set} type="button">
        设置存储
      </button>
      <input onChange={updateText} value={text} />
      <button onClick={get} type="button">
        获取存储
      </button>
    </>
  );
};
export default Page;
