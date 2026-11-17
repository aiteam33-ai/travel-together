"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Page, PrimaryButton, SecondaryButton, ProgressBar } from "../../../../components/ui";
import { useAppState, useT } from "../../../../lib/AppStateContext";
import { searchCities } from "../../../../lib/mock/cities";

export default function PlacePage() {
  const { state, update } = useAppState();
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState(state.birthDetails?.place?.name || "");
  const [selected, setSelected] = useState(state.birthDetails?.place || null);

  const results = query && !selected ? searchCities(query) : [];

  function handleChange(value) {
    setQuery(value);
    setSelected(null);
  }

  function handleSelect(city) {
    setSelected(city);
    setQuery(city.name);
  }

  function handleNext() {
    update({ birthDetails: { ...state.birthDetails, place: selected } });
    router.push("/start/birth/summary");
  }

  return (
    <Page>
      <ProgressBar step={4} total={4} />
      <p className="text-sm text-gray-500">{t("stepOf", { n: 4, total: 4 })}</p>
      <h1 className="text-2xl font-bold">{t("placeQuestion")}</h1>
      <p className="text-sm text-gray-500">{t("placeReason")}</p>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="min-h-[48px] border border-gray-300 rounded-md px-4 text-lg"
        autoFocus
      />
      {results.length > 0 && (
        <ul className="border border-gray-300 rounded-md divide-y">
          {results.map((city) => (
            <li key={city.name}>
              <button
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full text-left min-h-[48px] px-4 py-2"
              >
                {city.name}, {city.state}, India
              </button>
            </li>
          ))}
        </ul>
      )}
      {query && !selected && results.length === 0 && (
        <p className="text-sm text-gray-500">{t("placeNoMatch")}</p>
      )}

      <div className="flex gap-3 mt-4">
        <SecondaryButton onClick={() => router.push("/start/birth/time")}>{t("back")}</SecondaryButton>
        <PrimaryButton disabled={!selected} onClick={handleNext}>
          {t("next")}
        </PrimaryButton>
      </div>
    </Page>
  );
}
