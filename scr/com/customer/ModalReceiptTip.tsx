import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";

interface ModalReceiptTipProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalReceiptTip = ({ isOpen, onOpenChange }: ModalReceiptTipProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-2xl pb-2 pt-3 font-bold border-b border-gray-400 mb-4">
          Hướng dẫn thu tiền và Tạo phiếu thu tiền
        </ModalHeader>
        <ModalBody className="text-gray-800 pb-12">
          <h3 className="text-2xl font-bold">A. Hướng Dẫn Thu Tiền</h3>
          <h4 className="text-lg font-semibold">
            1. TVV mở hồ sơ khách hàng, trong mục <b>THANH TOÁN</b> góc trên bên
            phải, TVV thu tiền theo một trong 03 số tiền trong mục{" "}
            <b>THANH TOÁN</b>:
          </h4>
          <ul className="pl-6 list-disc">
            <li className="mb-2">
              <b>Theo dịch vụ đã thực hiện:</b> Bằng tổng số tiền (100%) của
              dịch vụ được Bác sĩ đã/ đang điều trị TRỪ tổng số tiền Khách hàng
              đã thanh toán trước đó.
            </li>
            <li className="mb-2">
              <b>Theo tiến độ điều trị:</b> Bằng tổng số tiền của dịch vụ được
              điều trị theo tiến độ của Bác sĩ đến ngày hôm nay TRỪ tổng số tiền
              khách hàng đã thanh toán trước đó.
            </li>
            <li className="mb-2">
              <b>Theo phương án đã chốt:</b> Bằng tổng số tiền của dịch được Bác
              sĩ đã chốt với khách hàng TRỪ tổng số tiền khách hàng đã thanh
              toán trước đó.
            </li>
          </ul>
          <h4 className="text-lg font-semibold">
            2. Trường hợp khách hàng không thanh toán đúng theo một trong ba số
            tiền trên thì Khách hàng có thể thanh toán bất kỳ số tiền nào nằm
            trong khoảng từ số nhỏ nhất (Theo tiến độ điều trị) đến số lớn nhất
            (Theo phương án đã chốt).
          </h4>
          <h4 className="text-lg font-semibold">
            3. Trường hợp khách hàng không đủ tiền với số nhỏ nhất (Theo tiến độ
            điều trị), thì khách hàng có thể thanh toán bất kỳ số tiền nào khách
            hàng đang có và thanh toán tiếp vào đợt điều trị tiếp theo.
          </h4>
          <h4 className="text-lg font-semibold">
            4. Nút <b>Xem chi tiết</b> góc dưới bên phải có đầy đủ thông tin TVV
            cần trả lời các câu hỏi Khách hàng:
          </h4>
          <ul className="pl-6 list-disc">
            <li className="mb-2">
              Hôm nay Bác sĩ điều trị những gì cho tôi? TVV chỉ cần đọc phần nội
              dung trong mỗi dịch vụ và/hoặc đọc thêm phần ghi chú.
            </li>
            <li className="mb-2">
              Tôi muốn thanh toán theo tiến độ điều trị của Bác sĩ? TVV chỉ cần
              đọc các dịch vụ và tiến độ, đồng thời nêu số tiền ở dòng
              <b>Theo tiến độ điều trị</b>.
            </li>
            <li className="mb-2">
              Tôi đã thanh toán bao nhiêu rồi? TVV trả lời tổng thanh toán và
              chi tiết các lần thanh toán trước đó.
            </li>
            <li className="mb-2">
              Tôi cần phải thanh toán bao nhiêu? TVV đọc số tiền{" "}
              <b>Theo phương án đã chốt</b>
            </li>
            <li className="mb-2">
              Tôi đã làm những dịch vụ gì và đến đâu rồi? TVV đọc từng dịch vụ
              được sắp xếp tiến độ hoàn thành 100% cho đến chưa thực hiện (0%).
            </li>
          </ul>
          <h4 className="text-lg font-semibold">
            5. Trường hợp các số thu tiền hiển thị không đúng với thực tế:
          </h4>
          <ul>
            <li className="mb-2">
              - Bác sĩ không thao tác tạo phiên khám và không nhập nội dung điều
              trị. (BS bắt buộc phải nhập)
            </li>
            <li className="mb-2">
              - Bác sĩ chốt phương án điều trị với nhiều dịch vụ trùng nhau, Số
              tiền Phương án đã chốt nhiều hơn so với thực tế phải thu khách
              hàng. (Bác sĩ bắt buộc phải thao tác chốt dịch vụ đúng)
            </li>
            <li className="mb-2">
              - Trường hợp Khách hàng của hệ thống KIMSYS trước đây đã thanh
              toán, chưa được chuyển qua hệ thống HIS mới. (Các trường hợp này
              không còn nhiều, Hệ thống sẽ chuyển dữ liệu thanh toán qua HIS)
            </li>
          </ul>
          <h3 className="text-2xl font-bold mt-6">B. Tạo Phiếu Thu Tiền</h3>
          <h4 className="text-lg font-semibold">
            1. TVV bấm nút <b> + PHIẾU THU</b> trong mục “THANH TOÁN” để tạo
            phiếu thu.
          </h4>
          <h4 className="text-lg font-semibold">
            2. Số tiền cần thu <b>Theo dịch vụ đã thực hiện</b> mặc định hiển
            thị ở ô dữ liệu “Số tiền”. Nếu khách hàng thanh toán số tiền khác
            thì TVV nhập chính xác số tiền đó vào ô dữ liệu “Số tiền”.
          </h4>
          <h4 className="text-lg font-semibold">
            3. Khách hàng có thể thanh toán bằng nhiều hình thức cùng một lúc:
            Hệ thống tự động nhập số tiền ở trên và/ hoặc tự động cộng/trừ số
            tiền ở các hình thức thanh toán khác nhau cho đúng với số tiền cần
            thu.
          </h4>
          <ul className="pl-6 list-disc">
            <li className="mb-2">Tiền mặt.</li>
            <li className="mb-2">
              Cà thẻ :TVV chọn loại máy POS (Lưu ý: chọn loại máy POS, không
              phải thẻ của Khách hàng)
            </li>
            <li className="mb-2">
              Chuyển khoản: TVV chọn ngân hàng nhận tiền của Nha khoa Kim{" "}
              <b>(Lưu ý: Không phải ngân hàng của khách hàng)</b>
            </li>
          </ul>
          <h4 className="text-lg font-semibold">
            4. TVV không cần ghi nội dung. Hệ thống tự động điền với nội dung:
            “Thu tiền điều trị nha khoa”. Và in 02 phiếu thu (Gởi khách hàng 1
            phiếu và lưu lại 1 phiếu gởi Kế toán).
          </h4>
          <h4 className="text-lg font-semibold">
            5. Trường hợp Khách hàng hỏi nội dung thu tiền cho các dịch vụ nào?
          </h4>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalReceiptTip;
