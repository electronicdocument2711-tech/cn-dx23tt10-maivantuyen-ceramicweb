"use client";

import { HTMLAttributes, useState, useEffect } from "react";
import { upperItems, lowerItems, renderItemSvg } from "@/com/diag/teethItems";
import Jaw from "@/com/diag/Jaw";
import Tooth from "@/com/diag/Tooth";

const isJaw = (item: string) => item === "1-2" || item === "3-4";

const TeethChart: React.FC<
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
      <Jaw>
        {upperItems.map((item) => (
          <Tooth onClick={() => onToothClick(item)} key={item}>
            {renderItemSvg(item, selecteds)}
          </Tooth>
        ))}
      </Jaw>
    );
  };

  const LowerTeethChart: React.FC = () => {
    return (
      <Jaw viewBox="0 0 320 222">
        {lowerItems.map((item) => (
          <Tooth onClick={() => onToothClick(item)} key={item}>
            {renderItemSvg(item, selecteds)}
          </Tooth>
        ))}
      </Jaw>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-2 items-center w-full" {...props}>
      <UpperTeethChart />
      <LowerTeethChart />
    </div>
  );
};

export default TeethChart;
