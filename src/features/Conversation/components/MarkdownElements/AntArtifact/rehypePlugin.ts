import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

const rehypePlugin = () => (tree: Node) => {
  let inAntArtifact = false;
  let artifactStartIndex: number | undefined;
  let ArtifactParent: any;
  let antArtifactNode: any;

  visit(tree, (node: any, index, parent) => {
    if (node.type === 'raw' && node.value.startsWith('<antArtifact')) {
      const match = node.value.match(/<antArtifact([^>]*)>/);
      if (match) {
        inAntArtifact = true;
        artifactStartIndex = index;

        const attributes = match[1];
        const properties: Record<string, string> = {};
        const attrRegex = /(\w+)="([^"]*)"/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attributes)) !== null) {
          properties[attrMatch[1]] = attrMatch[2];
        }
        const svgContent = node.value.slice(match[0].length);

        antArtifactNode = {
          children: [
            {
              type: 'raw',
              value: svgContent,
            },
          ],
          properties: properties,
          tagName: 'antArtifact',
          type: 'element',
        };

        parent.children.splice(index, 1, antArtifactNode);
        ArtifactParent = parent;
        return index;
      }
    }

    if (node.type === 'element' && node.tagName === 'p') {
      const artifactIndex = node.children.findIndex(
        (child: any) => child.type === 'raw' && child.value && child.value === '</antArtifact>',
      );

      const beforeNodes = node.children.slice(0, artifactIndex);

      if (artifactIndex !== -1 && inAntArtifact) {
        let artifactEndIndex = index;

        // 需要将 artifactStartIndex 和 artifactEndIndex 中间的元素全部收集起来，插入 antArtifactNode 的 children 中
        const artifactChildren = ArtifactParent.children.slice(
          artifactStartIndex + 1,
          artifactEndIndex,
        );

        ArtifactParent.children.splice(
          artifactStartIndex + 1,
          artifactEndIndex - artifactStartIndex,
        );

        antArtifactNode.children = [
          ...antArtifactNode.children,
          ...artifactChildren,
          ...beforeNodes,
        ];

        console.log(antArtifactNode);

        return undefined;
      }
    }
  });
};

export default rehypePlugin;
