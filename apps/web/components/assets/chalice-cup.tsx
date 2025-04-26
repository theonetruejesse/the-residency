import { CHALICE_IMG_URL } from "@/lib/constants";
import Image from "next/image";

export const ChaliceCup = () => {
  return (
    <div>
      <Image src={CHALICE_IMG_URL} alt="Chalice Cup" height={500} width={200} />
    </div>
  );
};
