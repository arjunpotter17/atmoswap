import { DropdownIcon } from "@/icons/dropdown.icon";
import { motion } from "framer-motion";

export const TransactionInfoBox = ({
  txInfoOpen,
  setTxInfoOpen,
  minimumReceived,
}: {
  txInfoOpen: boolean;
  setTxInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  minimumReceived: number;
}) => {
  return (
    <div className="flex flex-col gap-y-3">
      <div
        className="flex gap-x-2 items-center cursor-pointer"
        onClick={() => setTxInfoOpen(!txInfoOpen)}
      >
        <p className="text-xs text-atmos-grey-text transition-colors duration-200 hover:text-atmos-secondary-teal">
          Transaction Info
        </p>
        <div
          className={`transform transition-transform duration-300 ${
            txInfoOpen ? "rotate-180" : ""
          }`}
        >
          <DropdownIcon color="#7b818a" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col border border-atmos-grey-text p-4 rounded-lg text-xs text-atmos-grey-text"
      >
        <p className=" flex items-center justify-between">
          Minimum Received: <span>{minimumReceived.toFixed(3)}</span>
        </p>
        <p className=" flex items-center justify-between">
          Max Transaction Fee: <span>0.0004 (mock)</span>
        </p>
        <p className=" flex items-center justify-between">
          Price Impact: <span>0.2% (mock)</span>
        </p>
      </motion.div>
    </div>
  );
};
