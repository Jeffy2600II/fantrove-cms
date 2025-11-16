"use client";
import { useEffect, useState } from "react";
import FileList from "../../components/FileList";

export default function DashboardPage() {
  return (
    <div>
      <h2 className="font-bold text-2xl mb-6">All Files in fantrove-data</h2>
      <FileList folder="" />
    </div>
  )
}