import { forceSimulation, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { nanoid } from 'nanoid';
import SAT from 'sat';

const invisibleDist = 6;

const BalloonLayout = (nodes, edges, currentNode, stance, setNode, addNum=3, adjustLayer=true) => {
    const rootNode = nodes[0]
    const newPositions = [] // 所有需要更新的现有节点的位置
    const addPositions = [] // 新加入节点的位置
    const addEdges = [] // 新加入的边
    let expandFactor = 1.5 // 需要扩展的程度

    const findChildNodes = (id, nodes, edges) => {
        const childEdges = edges.filter(edge=>edge.source == id)
        const childNodeIds = childEdges.map(edge => edge.target)
        const childNodes = nodes.filter(node=>childNodeIds.includes(node.id))
        return childNodes
    }

    const layoutNodes = (parent, parentPosition=null, addNum=3)=>{
        const id = parent.id
        const childNodes = findChildNodes(id, nodes, edges)
        const childNodesSameSides = childNodes.filter((node)=>node.data.stance.label==stance && !node.hidden)
        const childNodeNum = parent.id == currentNode.id ? childNodesSameSides.length + addNum : childNodesSameSides.length
        let currentAngle, angleStart, angleEnd, angleStep, radius
        let curMaxIndex = childNodes.length>0 ? childNodes.reduce((max, node) => {
            return node.layerIndex > max ? node.layerIndex : max;
          }, -Infinity) : 0

        if (id == rootNode.id) {
            // 当节点为根节点时，需要根据立场选择第一层子节点的位置
            if (childNodeNum > 3) {
                angleStart = stance == 'support' ? -Math.PI * 75/180 : -Math.PI * 105/180 
                angleEnd = stance == 'support' ? Math.PI * 75/180  : - Math.PI * 255/180
            } else {
                angleStart = stance == 'support' ? -Math.PI/3 : -Math.PI/3*2
                angleEnd = stance == 'support' ? Math.PI/3 : - Math.PI/3*4
            }
            radius = 420
        } else if (parentPosition) {
            // 更新
            angleStart = parentPosition.angles.start
            angleEnd = parentPosition.angles.end
            radius = parentPosition.radius
        } else {
            // 当节点不为根节点时，需要拿出当前这个节点所允许的子节点的角度信息
            angleStart = parent.angles.start
            angleEnd = parent.angles.end
            radius = parent.radius
        }
        
        if (childNodeNum > 1) {
            angleStep = (angleEnd - angleStart) / (childNodeNum-1);
            currentAngle = angleStart;
        } else {
            currentAngle = (angleStart + angleEnd) / 2;
            angleStep = 0
        }

        // 当子节点多于3个时，需要将当前节点往外圈移动
        if (id != rootNode.id && childNodeNum > 3) {
            const curPos = newPositions.find((pos) => pos.id === parent.id) || nodes.find((node)=>node.id===parent.id)
            radius = curPos.radius * expandFactor 
            const curAng = Math.atan2(curPos.position.y, curPos.position.x)
            const newX = radius * Math.cos(curAng)
            const newY = radius * Math.sin(curAng)
            const dX = newX - curPos.position.x
            const dY = newY - curPos.position.y
            curPos.positionAbsolute.x += dX
            curPos.positionAbsolute.y += dY
            curPos.position.x = newX
            curPos.position.y = newY

            angleStart -= (expandFactor - 1) * (angleEnd - angleStart) / 2
            angleEnd += (expandFactor - 1) * (angleEnd - angleStart) / 2
            angleStep = (angleEnd - angleStart) / (childNodeNum-1);
            currentAngle = angleStart;
        } 

        // 已有同边节点继续更新
        childNodesSameSides.forEach((child, index) => {
            let childContainer = document.getElementById(`querynode-${child.id}`);
            let childW = childContainer.offsetWidth, childH = childContainer.offsetHeight

            // 只更新与当前节点同一侧（立场一致）的节点
            let x = radius * Math.cos(currentAngle);
            let y = radius * Math.sin(currentAngle);
            // let absoluteX = parent.positionAbsolute.x + x
            // let absoluteY = parent.positionAbsolute.y + y
            let absoluteX = parent.positionAbsolute.x + x - childW/2*(child.scale-1)
            let absoluteY = parent.positionAbsolute.y + y - childH/2*(child.scale-1)
            console.log('child', child, currentAngle, absoluteX, absoluteY)
            currentAngle += angleStep;
            let newPosition = { 
                id: child.id, 
                layerIndex: child.layerIndex,
                position: { x: x, y: y }, 
                positionAbsolute: {x: absoluteX, y: absoluteY},
                angles: {start: currentAngle - 3 * angleStep /2, end: currentAngle},
                radius: radius * 0.85
            }
            newPositions.push(newPosition);
            layoutNodes(child, newPosition);
        });

        // 获取新节点的位置
        if (parent.id == currentNode.id) {
            for (let i=0; i<addNum; i++) {
                let x = radius * Math.cos(currentAngle);
                let y = radius * Math.sin(currentAngle);
                let absoluteX = parent.positionAbsolute.x + x
                let absoluteY = parent.positionAbsolute.y + y
                currentAngle += angleStep;
                const addNodeId = nanoid()
                addPositions.push({
                    id: addNodeId,
                    // layerIndex: childNodes.length+i+1,
                    layerIndex: curMaxIndex+i+1,
                    position: { x: x, y: y },
                    positionAbsolute: {x: absoluteX, y: absoluteY},
                    angles: {start: currentAngle - 3 * angleStep /2, end: currentAngle},
                    radius: radius * 0.85,
                    scale: 1
                });
                addEdges.push({
                    source: parent.id,
                    target: addNodeId,
                })
            }   
        }
    }

    if (adjustLayer) {
        layoutNodes(currentNode, null, addNum)
    }

    const newNodes = nodes.map((node)=>{
        const newPosition = newPositions.find((pos) => pos.id === node.id);
        return newPosition ? { ...node, position: newPosition.position, positionAbsolute:newPosition.positionAbsolute, angles: newPosition.angles, radius: newPosition.radius } : node;
    })

    // setNode(newNodes)
    // return addPositions
    
    function splitArrayAtIndex(arr, index) {
        const firstPart = arr.slice(0, index);
        const secondPart = arr.slice(index);
        return [firstPart, secondPart];
      }
    
    const newNodesList = newNodes.concat(addPositions)
    const resolvedNodes = resolveCollisions(newNodesList)
    const [newNodesAdjust, newAddPositions] = splitArrayAtIndex(resolvedNodes, newNodes.length);
    setNode(newNodesAdjust)

    return {nodes: newNodesAdjust, positions: newAddPositions}
}

// 方法一
const resolveCollisions1 = (nodes, nodeRadius) => {
    const positions = nodes.map(node => ({ x: node.position.x, y: node.position.y }));

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = positions[j].x - positions[i].x;
            const dy = positions[j].y - positions[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = 2 * nodeRadius; // 假设节点的直径

            if (distance < minDistance) {
                // 计算调整量
                const overlap = minDistance - distance;
                const adjustment = overlap / 2;
                const angle = Math.atan2(dy, dx);

                // 调整节点位置
                positions[i].x -= adjustment * Math.cos(angle);
                positions[i].y -= adjustment * Math.sin(angle);
                positions[j].x += adjustment * Math.cos(angle);
                positions[j].y += adjustment * Math.sin(angle);
            }
        }
    }

    // 更新节点位置
    nodes.forEach((node, i) => {
        node.position.x = positions[i].x;
        node.position.y = positions[i].y;
    });
};

const minimalPenetrationDepth = (nodes) => {
    const detectCollision = (nodeA, nodeB) => {
        const ax = nodeA.position.x;
        const ay = nodeA.position.y;
        const bx = nodeB.position.x;
        const by = nodeB.position.y;
        const widthA = nodeA.width || 100;
        const heightA = nodeA.height || 50;
        const widthB = nodeB.width || 100;
        const heightB = nodeB.height || 50;

        return !(bx > ax + widthA ||
                 bx + widthB < ax ||
                 by > ay + heightA ||
                 by + heightB < ay);
    };

    const resolveCollision = (nodeA, nodeB) => {
        const dx = nodeB.position.x - nodeA.position.x;
        const dy = nodeB.position.y - nodeA.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = Math.sqrt((nodeA.width ** 2 + nodeA.height ** 2) / 4) + Math.sqrt((nodeB.width ** 2 + nodeB.height ** 2) / 4);

        if (dist < minDist) {
            const overlap = minDist - dist;
            const moveX = (overlap / dist) * dx / 2;
            const moveY = (overlap / dist) * dy / 2;

            nodeA.position.x -= moveX;
            nodeA.position.y -= moveY;
            nodeB.position.x += moveX;
            nodeB.position.y += moveY;
        }
    };

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (detectCollision(nodes[i], nodes[j])) {
                resolveCollision(nodes[i], nodes[j]);
            }
        }
    }
};

// 方法2
const calculateMPD1 = (nodeA, nodeB) => {
    const dx = nodeB.positionAbsolute.x - nodeA.positionAbsolute.x;
    const dy = nodeB.positionAbsolute.y - nodeA.positionAbsolute.y;
    const aWidth = nodeA.width ? nodeA.width : 200
    const aHeight = nodeA.showVis ? 315 : 110
    const bWidth = nodeB.width ? nodeB.width : 200
    const bHeight = nodeB.showVis? 315 : 110
    // const minDistanceX = (aWidth + bWidth) / 2 + 10;
    const minDistanceY = (aHeight + bHeight) / 2 + 10;

    const minDistanceX = 210  // +20是希望相隔一定距离
    // const minDistanceY = 320

    let penetrationDepthX = minDistanceX - Math.abs(dx);
    let penetrationDepthY = minDistanceY - Math.abs(dy);

    let paddingSpace = 5
    let vec = rectOverlapRect(nodeA.positionAbsolute.x-paddingSpace, nodeA.positionAbsolute.y-paddingSpace, aWidth+2*paddingSpace, aHeight+2*paddingSpace, nodeB.positionAbsolute.x-paddingSpace, nodeB.positionAbsolute.y-paddingSpace, bWidth+2*paddingSpace, bHeight+2*paddingSpace);
            

    console.log('mpd', vec, nodeA, nodeB, penetrationDepthX, penetrationDepthY, minDistanceX, minDistanceY)

    if (vec) {
        return {x: vec.x, y: vec.y}
    }

    // if (penetrationDepthX > 0 && penetrationDepthY > 0) {
    //     if (penetrationDepthX < penetrationDepthY) {
    //         return { x: penetrationDepthX * Math.sign(dx), y: 0 };
    //     } else {
    //         return { x: 0, y: penetrationDepthY * Math.sign(dy) };
    //     }

    //     // return {x: penetrationDepthX * Math.sign(dx), y: penetrationDepthY * Math.sign(dy)}
    // }

    return { x: 0, y: 0 };
};


// 用SAT
const calculateMPD = (nodeA, nodeB) => {
    let aWidth = nodeA.width ? nodeA.width : 200
    let bWidth = nodeB.width ? nodeB.width : 200
    let scaleA = nodeA.scale
    let scaleB = nodeB.scale
    let aHeight = 110, bHeight = 110

    const containerA = document.getElementById(`querynode-${nodeA.id}`);
    if (containerA) {
        aHeight = containerA.offsetHeight
    }

    const containerB = document.getElementById(`querynode-${nodeB.id}`);
    if (containerB) {
        bHeight = containerB.offsetHeight
    }

    aWidth = aWidth * scaleA
    aHeight = aHeight * scaleA
    bWidth = bWidth * scaleB
    bHeight = bHeight * scaleB

    let paddingSpace = 10
    let vec = rectOverlapRect(nodeA.positionAbsolute.x-paddingSpace, nodeA.positionAbsolute.y-paddingSpace, aWidth+2*paddingSpace, aHeight+2*paddingSpace, nodeB.positionAbsolute.x-paddingSpace, nodeB.positionAbsolute.y-paddingSpace, bWidth+2*paddingSpace, bHeight+2*paddingSpace);

    if (vec) {
        return {x: vec.x, y: vec.y}
    }

    return { x: 0, y: 0 };
}

const angleConstraint = (nodeA, nodeB, originalAngle) => {
    const dx = nodeB.position.x - nodeA.position.x;
    const dy = nodeB.position.y - nodeA.position.y;
    const currentAngle = Math.atan2(dy, dx);

    const angleDifference = currentAngle - originalAngle;
    const angleThreshold = Math.PI / 12; // 15 degrees

    if (Math.abs(angleDifference) > angleThreshold) {
        const correctionAngle = angleDifference > 0 ? angleThreshold : -angleThreshold;
        const newAngle = originalAngle + correctionAngle;

        const distance = Math.sqrt(dx * dx + dy * dy);
        nodeB.position.x = nodeA.position.x + distance * Math.cos(newAngle);
        nodeB.position.y = nodeA.position.y + distance * Math.sin(newAngle);
    }
};

const resolveCollisions = (nodes) => {
    let resolvedNodes = [...nodes];
    let collisionDetected
    let iterations = 0

    do{
        collisionDetected = false
        iterations++;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = resolvedNodes[i];
            const nodeB = resolvedNodes[j];
            const penetration = calculateMPD(nodeA, nodeB);
            
            if (penetration.x !== 0 || penetration.y !== 0) {
                console.log('penetration', penetration)
                const newAX = nodeA.position.x + penetration.x / 2
                const newAY = nodeA.position.y + penetration.y / 2
                const newBX = nodeB.position.x - penetration.x / 2
                const newBY = nodeB.position.y - penetration.y / 2

                const newAXAb = nodeA.positionAbsolute.x + penetration.x / 2
                const newAYAb = nodeA.positionAbsolute.y + penetration.y / 2
                const newBXAb = nodeB.positionAbsolute.x - penetration.x / 2
                const newBYAb = nodeB.positionAbsolute.y - penetration.y / 2
               
                const newNodeB = {
                    ...nodeB,
                    position: {
                        x: newBX,
                        y: newBY
                    },
                    positionAbsolute: {
                        x: newBXAb,
                        y: newBYAb
                    }
                }
                const newNodeA = {
                    ...nodeA,
                    position: {
                        x: newAX,
                        y: newAY
                    },
                    positionAbsolute: {
                        x: newAXAb,
                        y: newAYAb
                    }
                }

                resolvedNodes[j] = newNodeB;
                resolvedNodes[i] = newNodeA
                collisionDetected = true

                console.log('penetration', nodeA, nodeB, newNodeA, newNodeB)  
            }
        }
    }
    } while (collisionDetected && iterations < 20)

    return resolvedNodes;
};

let rectOverlapRect = (x1, y1, width1, height1, x2, y2, width2, height2) => {
    let rect1 = new SAT.Box(new SAT.Vector(x1, y1), width1, height1).toPolygon();
    let rect2 = new SAT.Box(new SAT.Vector(x2, y2), width2, height2).toPolygon();
    let response = new SAT.Response();
    let collided = SAT.testPolygonPolygon(rect2, rect1, response)
    if(collided){
        return response.overlapV;
    }
    return false;
}
  
const stressMajorization = (nodes, edges, maxIterations = 100, epsilon=0.01) => {
    const n = nodes.length
    const positions = nodes.map(node=>[node.position.x, node.position.y])
    
    const adjmat = getAdjMat(nodes, edges)
    const desiredDists = getDistMatrix(adjmat)
    
    console.log('sm', adjmat, desiredDists)
    const computeStress = () => {
        let stress = 0;
        edges.forEach(edge => {
            const sourceIndex = nodes.findIndex(node => node.id === edge.source);
            const targetIndex = nodes.findIndex(node => node.id === edge.target);
            const dx = positions[sourceIndex][0] - positions[targetIndex][0];
            const dy = positions[sourceIndex][1] - positions[targetIndex][1];
            const actualDist = Math.sqrt(dx * dx + dy * dy);
            const desiredDist = desiredDists[sourceIndex][targetIndex];  // 获取边的理想距离
            const weight = 1 / (desiredDist**2);  
            stress += weight * (actualDist - desiredDist) ** 2;
        });
        return stress;
    };

    let prevStress = computeStress();
    console.log('prevestress', prevStress)

    for (let k = 0; k < maxIterations; k++) {
        const forces = positions.map(() => [0, 0]);

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const dx = positions[j][0] - positions[i][0];
                const dy = positions[j][1] - positions[i][1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                const desiredDist = desiredDists[i][j]; 
                const force = (dist - desiredDist) / dist;

                forces[i][0] += force * dx;
                forces[i][1] += force * dy;
                forces[j][0] -= force * dx;
                forces[j][1] -= force * dy;
            }
        }

        for (let i = 0; i < n; i++) {
            // positions[i][0] += forces[i][0];
            // positions[i][1] += forces[i][1];

            nodes[i].position.x = forces[i][0]
            nodes[i].position.y = forces[i][1]
        }

        const currentStress = computeStress();
        const relativeChange = (prevStress - currentStress) / prevStress;
        console.log('currstree', currentStress)
        if (relativeChange < epsilon) {
            console.log(`Converged after ${k + 1} iterations`);
            break;
        }

        prevStress = currentStress;
    }

    return nodes
}

// const MDSLayout1 = (data, oldPos, EPSILON = 10e-2) => {
//     const nodes = data[NODES].map(x => x[NODE_ID]);
//     const nodeMap = new Map(nodes.map((d,i) => [d,i]));
//     const links = data[LINKS];
//     const nodeNum = nodes.length;

//     const adjmat = getAdjMat(nodeMap, links);
//     /** get Distance Matrix **/
//     const Dis = getDistMatrix(adjmat);

//     /** random inital pos **/
//     let X_curr = Array.from(Array(nodeNum), () => [Math.random(), Math.random()]);
//     let L_stable = Array.from(Array(nodeNum), () => Array(nodeNum).fill(0));
//     let C_stable = Array.from(Array(nodeNum), () => Array(2).fill(0));
    
//     /** if node has old pos, then use the old pos **/
//     for(let node in oldPos){
//         const id = node[0],
//             pos = node[1];
//         let index = nodeMap.get(id);
//         if(index === -1) continue;
//         X_curr[index] = pos;
//         L_stable[index][index] = weight_stable;
//         C_stable[index] = [weight_stable * pos[0], weight_stable * pos[1]];
//     }

//     let X_prev = _.cloneDeep(X_curr);

//     /** get weights **/
//     let weights = getWeights(Dis);
//     /** get L**/
//     let L = getLaplacian(weights);
//     L = matrixPlus(L, L_stable);

//     /** get J**/
//     let JM = getJ(weights, nodeNum);
//     /** get D **/
//     let D = getD(X_prev, Dis);

//     let b = matrixPlus(matrixDot(JM, D), C_stable);

//     let X_curr0 = conjugateGradient(L, b.map(d => [d[0]]));
//     let X_curr1 = conjugateGradient(L, b.map(d => [d[1]]));
//     X_curr = X_curr.map((d,i) => [X_curr0[i][0], X_curr1[i][0]]);

//     let stress_prev = stress(X_prev, weights, Dis, nodeNum),
//         stress_curr = stress(X_curr, weights, Dis, nodeNum);
//     let cnt = 0;
//     while((stress_prev - stress_curr)/stress_prev >= EPSILON && cnt++ < 1000){
//         X_prev = X_curr;
//         D = getD(X_prev, Dis);
//         b = matrixPlus(matrixDot(JM, D), C_stable);

//         // #cg
//         X_curr0 = conjugateGradient(L, b.map(d => [d[0]]));
//         X_curr1 = conjugateGradient(L, b.map(d => [d[1]]));
//         X_curr = getNewX(X_curr0, X_curr1);

//         stress_prev = stress(X_prev, weights, Dis, nodeNum);
//         stress_curr = stress(X_curr, weights, Dis, nodeNum);
//     }
//     console.log("stress"+cnt)
//     let map = new Map();
//     for(let i in nodes){
//         map.set(nodes[i], {
//             'x': X_curr[i][0],
//             'y': X_curr[i][1]
//         });
//     }
//     return map;
// }

function getAdjMat(nodes, edges) {
    let nodeNum = nodes.length
    let res = Array.from(Array(nodeNum), () => Array(nodeNum).fill(0));

    edges.forEach(function(edge) {
        const sourceIndex = nodes.findIndex(node => node.id === edge.source);
        const targetIndex = nodes.findIndex(node => node.id === edge.target);
        let w = 1;
        res[sourceIndex][targetIndex] = w
        res[targetIndex][sourceIndex] = w
    });
    return res;
}

function getDistMatrix(adjmat) {
    let nodeNum = adjmat.length;
    let dist = Array.from(Array(nodeNum), () => Array(nodeNum).fill(0));

    adjmat.forEach(function(row, i) {
        row.forEach(function(d, j) {
            if (d === 0)
                dist[i][j] = Number.POSITIVE_INFINITY;
            else {
                dist[i][j] = 1 / d; //the bigger weight,the shorter distance
            }
            dist[j][i] = dist[i][j]; //symmetry
        });
        dist[i][i] = 0;
    });

    // FloydWarshall
    for (let k = 0; k < nodeNum; k++) {
        for (let i = 0; i < nodeNum; i++) {
            for (let j = 0; j < nodeNum; j++) {
                let minDist;
                if (dist[i][k] === Number.POSITIVE_INFINITY ||
                    dist[k][j] === Number.POSITIVE_INFINITY) {
                    continue;
                } else {
                    minDist = (dist[i][j] < dist[i][k] + dist[k][j]) ? dist[i][j] : dist[i][k] + dist[k][j];
                }
                dist[i][j] = minDist;
            }
        }
    }

    /***********************************************************************
     * modified for add the invisible edges.
     **********************************************************************/
    for (let i = 0; i < nodeNum; i++) {
        for (let j = 0; j < nodeNum; j++) {
            if (j === i)
                continue;
            if (dist[i][j] === Number.POSITIVE_INFINITY) {
                dist[i][j] = invisibleDist;
            }
        }
    }
    return dist;
}

export { BalloonLayout, stressMajorization };