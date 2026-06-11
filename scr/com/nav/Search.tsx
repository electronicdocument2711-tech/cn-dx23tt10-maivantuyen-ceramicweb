"use client";
import React, { useEffect, useRef, useState } from "react";
import { IconSearch } from "@/com/icons/regular";
import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { Customer } from "@/types/define.d";
import { redirect } from "next/navigation";
import ModalAddCustomer from "../customer/ModalAddCustomer";
import { useDebounce } from "@/hook/useDebounce";
import rest from "@/lib/rest";
import { IconPlus } from "@tabler/icons-react";

const Search: React.FC = () => {
  const abortRef = useRef<AbortController | null>(null);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [searchChar, setSearchChar] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchDebounce = useDebounce<string>(searchChar, 500);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddSuccess = () => {
    if (window.location.pathname.includes("/customer")) {
      window.location.reload();
    }
  };

  const closeAc = () => {
    setSearchChar("");
  };

  useEffect(() => {
    if (!searchDebounce || searchDebounce.length === 0) {
      setCustomers([]);
      return;
    }

    const fetchCustomers = async () => {
      setLoading(true);
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      rest
        .get("/customer", {
          params: {
            search: searchDebounce,
            limit: 10,
          },
          signal: abortRef.current.signal,
        })
        .then((value) => {
          console.log(value.data);
          setCustomers(value.data.customers);
        })
        .catch(() => {
          setCustomers([]);
        })
        .finally(() => setLoading(false));
    };
    fetchCustomers();
    return () => {
      abortRef.current?.abort();
    };
  }, [searchDebounce]);

  return (
    <>
      <Autocomplete
        ref={inputRef}
        items={customers}
        placeholder="Tìm theo tên, mã, số phone..."
        aria-label="Tìm theo tên, mã, số phone..."
        variant="bordered"
        maxListboxHeight={600}
        scrollShadowProps={{ isEnabled: false }}
        startContent={<IconSearch size={22} />}
        listboxProps={{
          emptyContent: (
            <>
              <p className="mb-2 pb-2 border-b-1 border-b-gray-300">
                Không có kết quả phù hợp
              </p>
              <div className="-mx-2">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsOpenCreate(true);
                    setTimeout(() => inputRef.current?.blur(), 0);
                  }}
                  className="flex w-full p-2 rounded-lg items-center gap-3 hover:bg-sky-100"
                >
                  <Avatar
                    fallback={<IconPlus />}
                    size="sm"
                    className="shrink-0"
                  />
                  <span className="font-medium text-gray-800">
                    Tạo khách hàng mới
                  </span>
                </button>
              </div>
            </>
          ),
        }}
        inputValue={searchChar}
        onInputChange={setSearchChar}
        onClose={closeAc}
        isLoading={loading}
      >
        {(user) => (
          <AutocompleteItem
            key={user.CustomerId}
            aria-label={user.FullName}
            onPress={() => redirect(`/customer/${user.CustomerId}`)}
            // textValue={user.FullName}
          >
            <div className="flex gap-3 items-center ">
              <Avatar
                alt={user.FullName}
                className="shrink-0"
                size="sm"
                // src={user.CustomerId}
              />
              <div className="flex flex-col">
                <span className="font-semibold">{user.FullName}</span>
                <span className="text-sm text-gray-700">
                  {user.CustomerCode} - {user.PhoneNumbers?.[0]}
                </span>
              </div>
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>
      <ModalAddCustomer
        isOpen={isOpenCreate}
        setOpen={setIsOpenCreate}
        onSuccess={handleAddSuccess}
      />
    </>
  );
};

export default Search;
