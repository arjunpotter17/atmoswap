import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Edge, Node } from "react-flow-renderer";
import { getAsset } from "@/app/utils/fetchTokenMetadata";
import Spinner from "../spinner/spinner";

type RouteSwapInfo = {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  feeMint: string;
};

type RoutePlan = {
  swapInfo: RouteSwapInfo;
  percent: number;
};

interface RouteModalProps {
  routeData: {
    inputMint: string;
    outputMint: string;
    routePlan: RoutePlan[];
  };
  setShowRoutesModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RouteModal = ({
  routeData,
  setShowRoutesModal,
}: RouteModalProps) => {
  const { inputMint, outputMint, routePlan } = routeData;
  const [loading, setLoading] = useState<boolean>(false);
  // State to hold token names and images
  const [tokenData, setTokenData] = useState<{
    [key: string]: { name: string; image: string };
  }>({});

  // Fetch metadata
  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true);
      const data: { [key: string]: { name: string; image: string } } = {};

      // Fetch input token data
      const inputAsset = await getAsset(inputMint);
      data[inputMint] = {
        name: inputAsset.content.metadata.name || "Unknown Token",
        image: inputAsset.content.links.image || "",
      };

      // Fetch output token data
      const outputAsset = await getAsset(outputMint);
      data[outputMint] = {
        name: outputAsset.content.metadata.name || "Unknown Token",
        image: outputAsset.content.links.image || "",
      };

      // Fetch for intermediate tokens
      await Promise.all(
        routePlan.map(async (route) => {
          const routeAsset = await getAsset(route.swapInfo.outputMint);
          data[route.swapInfo.outputMint] = {
            name: routeAsset.content.metadata.name || "Unknown Token",
            image: routeAsset.content.links.image || "", // Fallback
          };
        })
      );

      setTokenData(data);
      setLoading(false);
    };
    fetchTokenData();
  }, [inputMint, outputMint, routePlan]);

  // Prepare nodes
  const nodes = useMemo(() => {
    //setup input node
    const inputNode: Node = {
      id: inputMint,
      data: {
        label: (
          <div className="flex flex-col gap-x-2 items-center">
            <img
              src={tokenData[inputMint]?.image}
              alt={tokenData[inputMint]?.name}
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
            <div className="text-[16px] font-bold">
              {routePlan[0]?.swapInfo.inAmount.slice(0, 4) + "..."}
            </div>
          </div>
        ),
      },
      position: { x: 100, y: 200 },
      style: {
        background: "#0bd790",
        width: "100px",
        height: "100px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "20%",
      },
    };

    //setup output node
    const outputNode: Node = {
      id: outputMint,
      data: {
        label: (
          <div className="flex gap-x-2 flex-col items-center">
            <img
              src={tokenData[outputMint]?.image}
              alt={tokenData[outputMint]?.name}
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
            <div className="text-[16px] font-bold">
              {routePlan[routePlan.length - 1]?.swapInfo.outAmount.slice(0, 4) +
                "..."}
            </div>
          </div>
        ),
      },
      position: { x: 800, y: 200 },
      style: {
        background: "#0bd790",
        width: "100px",
        height: "100px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "20%",
      },
    };

    const uniqueMints = [inputMint, outputMint];

    //setup an inter node for every unique mint (token) in the routemap
    const intermediateNodes = routePlan
      .map((route, index) => {
        if (
          !uniqueMints.includes(route.swapInfo.inputMint) ||
          !uniqueMints.includes(route.swapInfo.outputMint)
        ) {
          let id;
          if (!uniqueMints.includes(route.swapInfo.inputMint)) {
            uniqueMints.push(route.swapInfo.inputMint);
            id = route.swapInfo.inputMint;
          } else {
            uniqueMints.push(route.swapInfo.outputMint);
            id = route.swapInfo.outputMint;
          }
          return {
            id: id,
            data: {
              label: (
                <div className="flex gap-x-2 flex-col items-center">
                  <img
                    src={tokenData[route.swapInfo.outputMint]?.image}
                    alt={tokenData[route.swapInfo.outputMint]?.name}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                    }}
                  />
                </div>
              ),
            },
            position: { x: 400 + index * 200, y: 200 }, // Adjust positions dynamically
            style: {
              background: "#0bd790",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "20%",
            },
          };
        } else {
          return null;
        }
      })
      .filter((node) => node !== null);

    return [inputNode, ...intermediateNodes, outputNode];
  }, [inputMint, outputMint, routePlan, tokenData]);

  // Prepare edges
  const edges = useMemo(() => {
    return routePlan.map((route, index) => {
      const label = `${route.percent}% to ${
        tokenData[route.swapInfo.outputMint]?.name || "Unknown Token"
      } via ${route.swapInfo.label}`;
  
      return {
        id: `edge-${index}`,
        source: route.swapInfo.inputMint,
        target: route.swapInfo.outputMint,
        label: label,
        style: { stroke: "#0dbbac" },
        arrowHeadType: "arrowclosed",
      };
    });
  }, [routePlan, tokenData]);

  // State for nodes and edges
  const [reactFlowNodes, setReactFlowNodes] = React.useState<Node[]>([]);
  const [reactFlowEdges, setReactFlowEdges] = React.useState<Edge[]>([]);

  // Update when routeData or token data change
  useEffect(() => {
    setReactFlowNodes(nodes);
    setReactFlowEdges(edges);
  }, [nodes, edges]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-atmos-secondary-teal bg-opacity-10">
      <div className="bg-atmos-bg-black rounded-lg p-10 w-[80%] md:w-[800px]">
        <h2 className="text-lg font-bold mb-4">Order Route Plan</h2>
        {loading ? (
          <div className="flex flex-col gap-y-2 justify-center items-center h-[300px] w-full">
            <Spinner size={30} />
            <p className="text-sm text-atmos-grey-text">Sketching route...</p>
          </div>
        ) : (
          <div style={{ height: "300px", width: "100%" }}>
            <ReactFlow
              className="border border-atmos-primary-green rounded-lg flex justify-center items-center mb-4"
              nodes={reactFlowNodes}
              edges={reactFlowEdges}
              fitView
              nodesDraggable={false}
              nodesConnectable={false} // Ensure nodes are not editable
              panOnScroll
            >
              <Background />
            </ReactFlow>
          </div>
        )}
        <button
          onClick={() => setShowRoutesModal(false)}
          className="mt-8 bg-atmos-primary-green hover:scale-95 transition-all py-2 px-4 rounded-lg text-atmos-bg-black"
        >
          Close
        </button>
      </div>
    </div>
  );
};
