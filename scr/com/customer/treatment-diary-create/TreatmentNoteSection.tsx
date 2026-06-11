import { Checkbox, Textarea } from "@heroui/react";
import { useState } from "react";

interface TreatmentNoteSelectionProps {
  checkedMap: Record<number, boolean>;
  onToggleOption: (index: number, isSelected: boolean) => void;
}

interface TreatmentNoteFormProps {
  otherNote: string;
  onOtherNoteChange: (value: string) => void;
}

interface TreatmentNoteFollowUpProps {
  option: string;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
}

interface TreatmentNoteSectionProps {
  options: string[];
  selection: TreatmentNoteSelectionProps;
  form: TreatmentNoteFormProps;
  followUp: TreatmentNoteFollowUpProps;
  anesthesiaState?: Record<string, Record<number, AnesthesiaItemState>>;
  onAnesthesiaStateChange?: (
    state: Record<string, Record<number, AnesthesiaItemState>>,
  ) => void;
  errors?: {
    anesthesia?: Record<string, string>;
  };
}

interface AnesthesiaItemState {
  isSelected: boolean;
  quantity: string;
}

const TEXTAREA_WRAPPER_CLASS =
  "rounded-2xl bg-[#F3F3F4] !border-transparent !shadow-none data-[hover=true]:!border-transparent data-[hover=true]:!shadow-none group-data-[hover=true]:!border-transparent group-data-[hover=true]:!shadow-none group-data-[focus=true]:!border-transparent group-data-[focus=true]:!shadow-none group-data-[focus-visible=true]:!border-transparent group-data-[focus-visible=true]:!ring-0";

const ANESTHESIA_SECTION_TITLES = new Set([
  "Gây tê tại chỗ bằng",
  "Gây tê vùng bằng",
]);

const ANESTHESIA_DRUGS = [
  "Lidocain 2%",
  "Mepivacaine 3% (Không Adrenaline)",
  "Articaine 4%",
];

const createInitialAnesthesiaState = (): Record<
  string,
  Record<number, AnesthesiaItemState>
> =>
  Object.fromEntries(
    Array.from(ANESTHESIA_SECTION_TITLES).map((title) => [
      title,
      Object.fromEntries(
        ANESTHESIA_DRUGS.map((_, index) => [
          index,
          { isSelected: false, quantity: "" },
        ]),
      ),
    ]),
  );

const keepDigits = (value: string, maxLength: number) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const TreatmentNoteSection: React.FC<TreatmentNoteSectionProps> = ({
  options,
  selection,
  form,
  followUp,
  anesthesiaState: externalAnesthesiaState,
  onAnesthesiaStateChange,
  errors,
}) => {
  const { checkedMap, onToggleOption } = selection;
  const { otherNote, onOtherNoteChange } = form;
  const {
    option: followUpOption,
    isSelected: isFollowUpOptionSelected,
    onChange: onFollowUpOptionChange,
  } = followUp;
  // const [anesthesiaState, setAnesthesiaState] = useState(
  //   createInitialAnesthesiaState,
  // );

  const [internalAnesthesiaState, setInternalAnesthesiaState] = useState(
    createInitialAnesthesiaState,
  );

  const anesthesiaState = externalAnesthesiaState || internalAnesthesiaState;
  const setAnesthesiaState =
    onAnesthesiaStateChange || setInternalAnesthesiaState;

  const onToggleAnesthesiaDrug = (
    sectionTitle: string,
    drugIndex: number,
    isSelected: boolean,
  ) => {
    // setAnesthesiaState((prev) => ({
    //   ...prev,
    //   [sectionTitle]: {
    //     ...prev[sectionTitle],
    //     [drugIndex]: {
    //       ...prev[sectionTitle][drugIndex],
    //       isSelected,
    //       quantity: isSelected ? "1" : "",
    //     },
    //   },
    // }));

    const newState = {
      ...anesthesiaState,
      [sectionTitle]: {
        ...anesthesiaState[sectionTitle],
        [drugIndex]: {
          ...anesthesiaState[sectionTitle]?.[drugIndex],
          isSelected,
          quantity: isSelected ? "1" : "",
        },
      },
    };

    setAnesthesiaState(newState);
  };

  const onAnesthesiaQuantityChange = (
    sectionTitle: string,
    drugIndex: number,
    value: string,
  ) => {
    // setAnesthesiaState((prev) => ({
    //   ...prev,
    //   [sectionTitle]: {
    //     ...prev[sectionTitle],
    //     [drugIndex]: {
    //       ...prev[sectionTitle][drugIndex],
    //       quantity: keepDigits(value, 2),
    //     },
    //   },
    // }));

    const currentItem = anesthesiaState[sectionTitle]?.[drugIndex];
    if (!currentItem?.isSelected) return;

    const newState = {
      ...anesthesiaState,
      [sectionTitle]: {
        ...anesthesiaState[sectionTitle],
        [drugIndex]: {
          ...anesthesiaState[sectionTitle][drugIndex],
          quantity: keepDigits(value, 2),
        },
      },
    };

    setAnesthesiaState(newState);
  };

  const renderAnesthesiaGroup = (option: string, index: number) => {
    const groupState = anesthesiaState[option] ?? {};
    const isSelected = checkedMap[index] ?? false;

    return (
      <div className="flex flex-col gap-2">
        <Checkbox
          isSelected={isSelected}
          onValueChange={(selected) => onToggleOption(index, selected)}
        >
          <span className="text-foreground text-base font-medium">
            {option}
          </span>
        </Checkbox>

        {isSelected && (
          <div className="ml-11 flex flex-col">
            {ANESTHESIA_DRUGS.map((drugName, drugIndex) => {
              const itemState = groupState[drugIndex] ?? {
                isSelected: false,
                quantity: "",
              };

              return (
                <div
                  key={drugName}
                  className={`flex items-center justify-between gap-4 py-2 pr-15 ${
                    drugIndex !== ANESTHESIA_DRUGS.length - 1
                      ? "border-b border-default-200"
                      : ""
                  }`}
                >
                  <Checkbox
                    isSelected={itemState.isSelected}
                    onValueChange={(selected) => {
                      onToggleAnesthesiaDrug(option, drugIndex, selected);
                    }}
                  >
                    <span className="text-foreground text-base font-medium">
                      {drugName}
                    </span>
                  </Checkbox>

                  <div className="flex h-10 w-32 shrink-0 items-center overflow-hidden rounded-xl border border-default-300 bg-default-50">
                    <input
                      value={itemState.quantity}
                      onChange={(event) => {
                        onAnesthesiaQuantityChange(
                          option,
                          drugIndex,
                          event.target.value,
                        );
                      }}
                      disabled={!itemState.isSelected}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="___"
                      className="h-full w-full bg-white px-6 text-sm text-center font-semibold text-[#6D8197] outline-none placeholder:text-[#AAB4C0]"
                    />
                    <span className="flex h-full items-center border-l border-default-300 px-3 text-base font-medium text-[#6D8197]">
                      ống
                    </span>
                  </div>
                </div>
              );
            })}

            {errors?.anesthesia?.[option] && (
              <p className="mt-2 text-sm text-danger">
                {errors.anesthesia[option]}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-default-300">
        {options.map((option, index) => (
          <div
            key={option}
            className={`px-4 py-3 ${
              index !== options.length - 1 ? "border-b border-default-200" : ""
            }`}
          >
            {ANESTHESIA_SECTION_TITLES.has(option) ? (
              renderAnesthesiaGroup(option, index)
            ) : (
              <Checkbox
                isSelected={checkedMap[index] ?? false}
                onValueChange={(isSelected) =>
                  onToggleOption(index, isSelected)
                }
              >
                <span className="text-foreground text-base font-medium">
                  {option}
                </span>
              </Checkbox>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-foreground text-base font-medium">Khác</p>
        <Textarea
          value={otherNote}
          onChange={(event) => onOtherNoteChange(event.target.value)}
          placeholder="Nhập ghi chú"
          minRows={2}
          variant="bordered"
          classNames={{
            inputWrapper: TEXTAREA_WRAPPER_CLASS,
            input: "text-base placeholder:text-[#7A8593]",
          }}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-default-300">
        <div className="px-4 py-3">
          <Checkbox
            isSelected={isFollowUpOptionSelected}
            onValueChange={onFollowUpOptionChange}
          >
            <span className="text-foreground text-base font-medium">
              {followUpOption}
            </span>
          </Checkbox>
        </div>
      </div>
    </div>
  );
};

export default TreatmentNoteSection;
