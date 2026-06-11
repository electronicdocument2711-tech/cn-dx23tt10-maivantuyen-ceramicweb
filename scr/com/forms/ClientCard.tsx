import React from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import Image from "next/image";
import { IconUserCircle } from "../icons/regular";
import { IconMessageCircle, IconPlus } from "../icons/outline";

const ClientCard = () => {
  return (
    <section className="container w-full mt-7 mx-9">
      <div className="flex gap-6">
        <Card shadow="sm" className="pt-5 px-6 pb-7">
          <CardHeader className="p-0 pb-6 flex flex-col gap-5">
            <div className="flex w-full justify-between items-start">
              <Image
                src="/UserAvatar.png"
                alt="Avatar"
                width={68}
                height={68}
              />

              <div className="flex gap-3">
                <Button variant="ghost">
                  <IconMessageCircle size={18} />
                  Nhắc hẹn
                </Button>
                <Button color="primary">
                  <IconPlus size={24} />
                  <p className="">Tư vấn</p>
                </Button>
              </div>
            </div>

            <h1 className="self-start font-bold text-3xl">Lê Hoàng Giang</h1>
          </CardHeader>

          <CardBody className="p-0">
            <hr className="border-t border-slate-300" />

            <div className="flex justify-between pt-7">
              <p className="font-bold">Thông tin</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-gray-200 py-3 px-4 flex  rounded-xl items-start gap-4">
                <IconUserCircle size={24} className="text-blue-500" />

                <div className="flex flex-col gap-2">
                  <p className="text-slate-700 pr-11">Mã khách hàng</p>
                  <p className="font-semibold">KH241000008</p>
                </div>
              </div>

              <div className="bg-gray-200 py-3 px-4 flex  rounded-xl items-start gap-4">
                <IconUserCircle size={24} className="text-blue-500" />

                <div className="flex flex-col gap-2">
                  <p className="text-slate-700 pr-11">Mã khách hàng</p>
                  <p className="font-semibold">KH241000008</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
};

export default ClientCard;
