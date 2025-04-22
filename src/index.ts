import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { diffChars } from "diff";

interface ComparePluginOptions {
  comparisonContent: any;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    compare: {
      setComparisonContent: (content: any) => ReturnType;
    };
  }
}

const pluginKey = new PluginKey("comparePlugin");

const ComparePlugin = Extension.create<ComparePluginOptions>({
  name: "compare",

  addOptions() {
    return {
      comparisonContent: ""
    };
  },

  addCommands() {
    return {
      setComparisonContent:
        (content: string) =>
          ({ state, dispatch }) => {
            const tr = state.tr.setMeta(pluginKey, {
              comparisonContent: content,
            });

            if (dispatch) dispatch(tr);
            return true;
          },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pluginKey,
        state: {
          init: (_, { doc }) => {
            return {
              comparisonContent: this.options.comparisonContent,
              options: this.options,
            };
          },
          apply(tr, pluginState, _, newState) {
            const meta = tr.getMeta(pluginKey);
            if (meta && meta.comparisonContent !== undefined) {
              return {
                ...pluginState,
                comparisonContent: meta.comparisonContent,
              };
            }
            return pluginState;
          },
        },
        props: {
          decorations(state) {
            const pluginState = pluginKey.getState(state);
            if (!pluginState) return null;

            const { comparisonContent } = pluginState;
            if (!comparisonContent) return null;
            if (!comparisonContent.content) return null;
            if (!comparisonContent.content[0].content) return null;

            const decos: Decoration[] = [];
            const oldContent = comparisonContent;
            const newContent = state.doc.toJSON();

            const oldNodes = oldContent.content;
            const newNodes = newContent.content;

            let pos = 0;

            for (
              let i = 0;
              i < Math.max(oldNodes?.length, newNodes?.length);
              i++
            ) {
              const oldNode = oldNodes[i];
              const newNode = newNodes[i];

              if (!oldNode) {
                // Node added
                const nodeSize = state.doc.nodeAt(pos)?.nodeSize || 0;
                decos.push(
                  Decoration.node(pos, pos + nodeSize, {
                    class: "diff-added  bg-[#e6ffec] text-green-500",
                  })
                );
                pos += nodeSize;
              } else if (!newNode) {
                // Node removed
                decos.push(Decoration.widget(pos, createRemovedNode(oldNode)));
              } else if (oldNode.type !== newNode.type) {
                // Node type changed
                const nodeSize = state.doc.nodeAt(pos)?.nodeSize || 0;
                decos.push(
                  Decoration.node(pos, pos + nodeSize, {
                    class: "diff-modified bg-[#ffefc6] text-red-500",
                  })
                );
                pos += nodeSize;
              } else {
                // Compare node content
                const oldText = nodeToText(oldNode);
                const newText = nodeToText(newNode);

                const diff = diffChars(oldText, newText);
                let nodePos = pos + 1; // +1 to skip the node start tag

                diff.forEach((part) => {
                  const length = part.value.length;
                  if (part.added) {
                    decos.push(
                      Decoration.inline(nodePos, nodePos + length, {
                        class: "diff-added  bg-[#e6ffec] text-green-500",
                      })
                    );
                    nodePos += length;
                  } else if (part.removed) {
                    decos.push(
                      Decoration.widget(nodePos, createRemovedSpan(part.value))
                    );
                  } else {
                    nodePos += length;
                  }
                });

                pos += state.doc.nodeAt(pos)?.nodeSize || 0;
              }
            }

            return DecorationSet.create(state.doc, decos);
          },
        },
      }),
    ];
  },
});

function nodeToText(node: any): string {
  if (node.type === "text") {
    return node.text || "";
  } else if (node.type === "paragraph") {
    if (!node.content) return " \n";
    return node.content?.map(nodeToText).join("") + "\n";
  } else if (node.type === "image") {
    return `[Image: ${node.attrs.alt || "No alt text"} (${node.attrs.src})]\n`;
  } else if (node.content) {
    return node.content.map(nodeToText).join("");
  }
  return "";
}

function createRemovedSpan(text: string) {
  const span = document.createElement("span");
  span.className = "diff-removed bg-[#ffebe9] line-through text-red-500";
  span.textContent = text;
  return span;
}

function createRemovedNode(node: any) {
  const div = document.createElement("div");
  div.className =
    "diff-removed-node bg-[#ffebe9] line-through px-0 py-0.5 text-red-500";
  div.textContent = nodeToText(node);
  return div;
}
export { ComparePlugin };

export default ComparePlugin;