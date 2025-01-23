"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "hey i am your agent I can assist you with booking, rescheduling, or retrieving details about your appointments. If you need help with any of these, feel free to ask!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const userMessage: Message = { role: "user", content: input };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "/api/generate",
        JSON.stringify({ userContext: { ...messages, ...userMessage } })
      );

      // const reader = data.getReader()
      // const decoder = new TextDecoder()
      // let done = false
      // let accumulatedResponse = ""

      // while (!done) {
      //   const { value, done: doneReading } = await reader.read()
      //   done = doneReading
      //   const chunkValue = decoder.decode(value)
      //   accumulatedResponse += chunkValue

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: response.data },
      ]);
      //}
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Sorry, an error occurred. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" flex  items-center justify-center h-screen ">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Appointment Agent</CardTitle>
        </CardHeader>
        <CardContent className="h-[60vh] overflow-y-auto">
          {messages.map((m, index) => (
            <div
              key={index}
              className={`mb-4 ${
                m.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block p-2 rounded-lg ${
                  m.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {m.content}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="text-left">
              <span className="inline-block p-2 rounded-lg bg-gray-200 text-black">
                AI is typing...
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="!pb-2">
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow "
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </form>
        </CardFooter>
        <span className=" text-xs flex items-center  text-gray-600 p-2 justify-center">
          Phone Number should be unique
        </span>
      </Card>
    </div>
  );
}
