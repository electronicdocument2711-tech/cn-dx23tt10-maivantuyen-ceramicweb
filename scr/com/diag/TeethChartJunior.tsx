"use client";

import { HTMLAttributes, useState, useEffect } from "react";
import Jaw from "@/com/diag/Jaw";
import Tooth from "@/com/diag/Tooth";
import {
  upperJuniorItems,
  lowerJuniorItems,
  renderItemSvg,
} from "@/com/diag/teethItems";

const isJaw = (item: string) => item === "5-6" || item === "7-8";

const TeethChartJunior: React.FC<
  HTMLAttributes<HTMLDivElement> & { onChange: (items: string[]) => void }
> = ({ onChange, ...props }) => {
  const [selecteds, setSelecteds] = useState<string[]>([]);

  useEffect(() => {
    onChange?.(selecteds);
  }, [selecteds, onChange]);

  const onToothClick = (item: string) => {
    if (isJaw(item)) onJawClick(item);
    else if (selecteds.includes(item))
      setSelecteds(selecteds.filter((i) => i !== item));
    else setSelecteds([...selecteds.filter((i) => !isJaw(i)), item]);
  };

  const onJawClick = (item: string) => {
    if (selecteds.includes(item))
      setSelecteds(selecteds.filter((i) => i !== item));
    else setSelecteds([...selecteds.filter(isJaw), item]);
  };

  const UpperTeethChart: React.FC = () => {
    return (
      <Jaw className="px-4">
        {upperJuniorItems.map((item) => (
          <Tooth onClick={() => onToothClick(item)} key={item}>
            {renderItemSvg(item, selecteds)}
          </Tooth>
        ))}
      </Jaw>
    );
  };

  const LowerTeethChart: React.FC = () => {
    return (
      <Jaw className="px-4">
        {lowerJuniorItems.map((item) => (
          <Tooth onClick={() => onToothClick(item)} key={item}>
            {renderItemSvg(item, selecteds)}
          </Tooth>
        ))}
      </Jaw>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-8 items-center w-full" {...props}>
      <UpperTeethChart />
      <LowerTeethChart />
    </div>
  );
};

export default TeethChartJunior;
