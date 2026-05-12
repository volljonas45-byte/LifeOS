"use client";

import { useState, useEffect } from "react";

export interface WeatherData {
  temperature: number;
  windspeed: number;
  icon: string;
  label: string;
  loading: boolean;
  error: boolean;
}

const ENDPOINT =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=49.13&longitude=9.06" +
  "&current=temperature_2m,weathercode,windspeed_10m" +
  "&timezone=Europe%2FBerlin";

function resolveWeatherCode(code: number): { icon: string; label: string } {
  if (code === 0)                      return { icon: "☀️",  label: "Sonnig" };
  if (code === 1)                      return { icon: "🌤",  label: "Leicht bewölkt" };
  if (code === 2)                      return { icon: "⛅",  label: "Bewölkt" };
  if (code === 3)                      return { icon: "☁️",  label: "Bedeckt" };
  if (code === 45 || code === 48)      return { icon: "🌫",  label: "Nebel" };
  if (code >= 51 && code <= 67)        return { icon: "🌦",  label: "Regen" };
  if (code >= 71 && code <= 77)        return { icon: "❄️",  label: "Schnee" };
  if (code >= 80 && code <= 82)        return { icon: "🌧",  label: "Schauer" };
  if (code >= 95 && code <= 99)        return { icon: "⛈",  label: "Gewitter" };
  return { icon: "🌡",  label: "Unbekannt" };
}

export function useWeather(): WeatherData {
  const [data, setData] = useState<WeatherData>({
    temperature: 0,
    windspeed: 0,
    icon: "🌤",
    label: "Laden…",
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    fetch(ENDPOINT)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const cur = json.current;
        const { icon, label } = resolveWeatherCode(cur.weathercode);
        setData({
          temperature: Math.round(cur.temperature_2m * 10) / 10,
          windspeed: Math.round(cur.windspeed_10m),
          icon,
          label,
          loading: false,
          error: false,
        });
      })
      .catch(() => {
        if (!cancelled) setData((p) => ({ ...p, loading: false, error: true }));
      });
    return () => { cancelled = true; };
  }, []);

  return data;
}
