"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { joinGameRequest } from "@/src/store/slices/gameSlice";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function JoinGame() {
    return (
        <div>Hello</div>
    );
}
