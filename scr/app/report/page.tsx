import AppointmentFunnel from "@/com/widget/AppointmentFunnel";
import ClinicPerformance from "@/com/widget/ClinicPerformance";
import DoctorPerformance from "@/com/widget/DoctorPerformance";
import OperateTracking from "@/com/widget/OperateTracking";
import RevenueTrend from "@/com/widget/RevenueTrend";
import ServiceBreakdown from "@/com/widget/ServiceBreakdown";

const ReportPage = () => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-3">Các báo cáo</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl">
          <RevenueTrend delay={100} />
        </div>
        <div className="bg-white p-4 rounded-xl">
          <div className="mb-2">
            <AppointmentFunnel delay={300} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl my-6">
        <OperateTracking />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl">
          <DoctorPerformance delay={500} />
        </div>
        <div className="bg-white p-4 rounded-xl">
          <ClinicPerformance delay={700} />
        </div>
        <div className="bg-white p-4 rounded-xl">
          <ServiceBreakdown delay={900} />
        </div>
      </div>
    </>
  );
};

export default ReportPage;
