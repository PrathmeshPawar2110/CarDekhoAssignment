import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { cn } from '@/lib/utils'
import type { TraceEvent } from '@/types'

const GRAPH_NODE_DEFS = [
  { id: 'parse_preferences', label: 'Parse\nPreferences', y: 0 },
  { id: 'search_web', label: 'Search\nWeb', y: 110 },
  { id: 'extract_cars', label: 'Extract\nCars', y: 220 },
  { id: 'generate_reasoning', label: 'Generate\nReasoning', y: 330 },
  { id: 'format_response', label: 'Format\nResponse', y: 440 },
]

type NodeStatus = 'idle' | 'running' | 'done' | 'error'

const STATUS_STYLES: Record<NodeStatus, string> = {
  idle: 'border-gray-300 bg-white text-gray-500',
  running: 'border-blue-400 bg-blue-50 text-blue-700 animate-pulse',
  done: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  error: 'border-red-400 bg-red-50 text-red-700',
}

function AgentNode({ data }: { data: { label: string; status: NodeStatus; detail?: string } }) {
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl border-2 text-center min-w-[130px] shadow-sm transition-all duration-300',
        STATUS_STYLES[data.status]
      )}
    >
      <div className="font-semibold text-xs whitespace-pre-line leading-relaxed">{data.label}</div>
      {data.status === 'done' && (
        <div className="text-emerald-500 text-xs mt-1">✓ done</div>
      )}
      {data.status === 'running' && (
        <div className="text-blue-400 text-xs mt-1">⟳ running...</div>
      )}
      {data.detail && data.status === 'done' && (
        <div className="text-xs text-gray-400 mt-1 truncate max-w-[120px]" title={data.detail}>
          {data.detail}
        </div>
      )}
    </div>
  )
}

const nodeTypes = { agentNode: AgentNode }

interface Props {
  trace: TraceEvent[]
  isOpen: boolean
  onToggle: () => void
  streamStatus: 'idle' | 'streaming' | 'done' | 'error'
}

export function AgentTracePanel({ trace, isOpen, onToggle, streamStatus }: Props) {
  const traceMap = useMemo(() => {
    const m: Record<string, TraceEvent> = {}
    for (const t of trace) m[t.node] = t
    return m
  }, [trace])

  const getNodeStatus = useCallback(
    (nodeId: string): NodeStatus => {
      const t = traceMap[nodeId]
      if (!t) {
        if (streamStatus === 'streaming') {
          // Find first node that's not yet done — mark it running
          const doneSet = new Set(Object.keys(traceMap))
          const firstPending = GRAPH_NODE_DEFS.find((n) => !doneSet.has(n.id))
          if (firstPending?.id === nodeId) return 'running'
        }
        return 'idle'
      }
      return t.status as NodeStatus
    },
    [traceMap, streamStatus]
  )

  const nodes: Node[] = GRAPH_NODE_DEFS.map((def) => ({
    id: def.id,
    type: 'agentNode',
    position: { x: 60, y: def.y },
    data: {
      label: def.label,
      status: getNodeStatus(def.id),
      detail: traceMap[def.id]?.detail,
    },
    draggable: false,
  }))

  const edges: Edge[] = GRAPH_NODE_DEFS.slice(0, -1).map((def, i) => ({
    id: `e${i}`,
    source: def.id,
    target: GRAPH_NODE_DEFS[i + 1].id,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    animated: streamStatus === 'streaming',
  }))

  return (
    <div
      className={cn(
        'fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-xl transition-all duration-300 z-40 flex flex-col overflow-hidden',
        isOpen ? 'w-72' : 'w-0 border-l-0'
      )}
    >
      {/* Toggle button — sits outside the panel width so always visible */}
      <button
        onClick={onToggle}
        className={cn(
          'fixed top-1/2 -translate-y-1/2 w-8 h-12 bg-white border border-gray-200 rounded-l-xl shadow-md flex items-center justify-center text-gray-500 hover:text-blue-600 transition-all duration-300 z-50',
          isOpen ? 'right-72' : 'right-0'
        )}
        title={isOpen ? 'Close trace panel' : 'Open agent trace'}
      >
        <svg
          className={cn('w-4 h-4 transition-transform duration-300', isOpen ? 'rotate-0' : 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-800 text-sm">🧠 Agent Trace</h3>
            <p className="text-xs text-gray-400 mt-0.5">LangGraph execution pipeline</p>
          </div>

          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              proOptions={{ hideAttribution: true }}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnDoubleClick={false}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
            >
              <Background color="#f1f5f9" gap={20} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>

          {/* Trace log */}
          <div className="border-t p-3 max-h-40 overflow-y-auto space-y-1.5">
            {trace.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">
                {streamStatus === 'idle' ? 'Run a search to see agent steps' : 'Waiting for first node...'}
              </p>
            ) : (
              trace.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                  <div>
                    <span className="font-medium text-gray-700">{t.node.replace(/_/g, ' ')}</span>
                    <span className="text-gray-400 ml-1">— {t.detail}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
