"use client";
"/dashboard";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { todo } from "../../../src/db/schema";
import { useDebounceValue } from "usehooks-ts";

export default function Dashboard() {
  const { user } = useUser();
  const [todos, setTodos] = useState<(typeof todo.$inferSelect)[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubscribe, setIsSubscription] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debounceSearchTerm] = useDebounceValue(searchTerm, 300); // will update after every 300ms

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/todos?search=${encodeURIComponent(debounceSearchTerm)}`);

        if (!res.ok) {
          throw new Error("Failed to fetch todos");
        }

        const json = await res.json();
        if (json.success) {
          setTodos(json.todos);
        }

      } catch (e) {
        console.error(e);
        alert("Failed to fetch todos");
      } finally { setLoading(false) };
    };

    fetchTodos();

  }, [debounceSearchTerm]);

  useEffect(() => {
    const fetchSubscription = async() => {
        const res = await fetch("/api/subscription");
        if(!res.ok){
            throw new Error("Failed to fetch subscription");
        }
        const json = await res.json();
        if(json.success){
            setIsSubscription(json.isSubscribed);
        }
    };

    fetchSubscription();
    
  }, []);

  const handleAddTodo = async(title: string) => {

    try {

        if(!title) return alert("Please enter a title");
        
        const res = await fetch("/api/todos", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ title }),
        });
        if(!res.ok){
            throw new Error("Failed to add todo");
        };
    
        const json = await res.json();
        if(json.success){ setTodos([...todos, json.todo]) };
        
    } catch (error) {
        alert(`Failed to add todo: ${(error as Error).message}`);
    }

  };

  const handleUpdateTodo = async(id:string, completed:boolean)=>{
    try {
      
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ completed }),
      });
      if(!res.ok){
        throw new Error("Failed to update todo");
      };

      const json = await res.json();
      if(json.success){
        setTodos(todos.map(t => t.id === Number(id) ? json.todo : t));
      };
      
    } catch (error) {
      alert(`Failed to update todo: ${(error as Error).message}`);
    }

  };

  const handleDelete = async(id: string) => {

    if(id && !confirm("Are you sure you want to delete this todo?")){
        return;
    };

    const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
    });

    if(!res.ok){
        throw new Error("Failed to delete todo");
    };

    const json = await res.json();
    if(json.success){
        setTodos(todos.filter(t => t.id !== Number(id)));
    };

  }

  return (
    <div className="text-white">
      <h1>Dashboard</h1>
    </div>
  );
}
