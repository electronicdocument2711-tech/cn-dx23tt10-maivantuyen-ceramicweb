"use client";

import { videoIntro } from "@/data/videoIntro";
import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import Image from "next/image";
import { useState } from "react";

const DentalxNews = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");

  return (
    <div className="p-4 rounded-3xl pb-5 bg-white border border-default-200">
      <h2 className="mb-4 mt-2">Hướng dẫn sử dụng</h2>
      <ul>
        {videoIntro.map((video) => (
          <li
            key={video.idx}
            className="flex items-start mb-4 cursor-pointer"
            onClick={() => {
              setSelectedVideoId(video.youtubeId);
              onOpen();
            }}
          >
            <Image
              alt={video.title}
              src={`https://i.ytimg.com/vi_webp/${video.youtubeId}/maxresdefault.webp`}
              width={72}
              height={40.5}
              className="w-18 h-15 mr-4 bg-gray-200 rounded-md shrink-0 object-cover"
            />
            <div>
              <h4 className="font-semibold mb-2">{video.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{video.desc}</p>
            </div>
          </li>
        ))}
      </ul>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl"
        classNames={{
          base: "p-0 overflow-hidden",
          body: "p-0",
        }}
      >
        <ModalContent className="mx-auto">
          {() => (
            <>
              <iframe
                width="1025"
                height="580"
                src={`https://www.youtube.com/embed/${selectedVideoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DentalxNews;
