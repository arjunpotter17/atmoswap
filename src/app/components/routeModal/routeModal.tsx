export const RouteModal = ({
  routes,
  setShowRoutesModal,
}: {
  routes: any[];
  setShowRoutesModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-atmos-secondary-teal bg-opacity-10">
      <div className="bg-atmos-bg-black rounded-lg p-10 w-[80%] md:w-[400px]">
        <h2 className="text-lg font-bold">Order Route Plan</h2>
        <div className="flex flex-col mt-4">
          {routes.map((route: any, index: number) => (
            <div key={index} className="flex justify-between">
              <span className="text-sm">{route.swapInfo.label}</span>
              <span className="text-atmos-secondary-teal">
                {route.percent} %
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowRoutesModal(false)}
          className="mt-8 bg-atmos-primary-green py-2 px-4 rounded-lg text-atmos-bg-black"
        >
          Close
        </button>
      </div>
    </div>
  );
};
