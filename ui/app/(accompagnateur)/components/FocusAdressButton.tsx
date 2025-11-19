"use client";
import { useFocusSearchContext } from "../context/FocusSearchContext";
import { AddressButton } from "../page.styled";

export default function FocusAdressButton() {
  const { focusField } = useFocusSearchContext();

  return (
    <AddressButton
      iconOnly
      iconSize="lg"
      iconId="ri-arrow-right-line"
      size="small"
      rounded
      variant="white"
      priority="tertiary no outline"
      title="Mon adresse"
      onClick={() => focusField("address")}
    ></AddressButton>
  );
}
