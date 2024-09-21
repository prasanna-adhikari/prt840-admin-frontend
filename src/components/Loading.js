import { PulseLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <PulseLoader color="#3B82F6" size={15} margin={2} />
    </div>
  );
};

export default Loading;
