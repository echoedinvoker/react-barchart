import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import db from './firestore';
import { onSnapshot, collection } from "firebase/firestore";

const MAX_RANGE_Y = 500
const MAX_RANGE_X = 500
const SVG_WIDTH = 600
const SVG_HEIGHT = 600
const MARGIN = { top: 20, right: 20, left: 100, bottom: 100 }

function D3js() {
  const canvasRef = useRef(null)
  const rects = useRef([])
  const yAxisGraph = useRef(null)
  const xAxisGraph = useRef(null)
  const y = useRef(null)
  const x = useRef(null)
  const graph = useRef(null)

  const graphWidth = SVG_WIDTH - MARGIN.left - MARGIN.right
  const graphHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom


  useEffect(() => {
    const svg = d3.select(canvasRef.current).append('svg').attr('width', SVG_WIDTH).attr('height', SVG_HEIGHT)
    graph.current = svg.append('g').attr('width', graphWidth).attr('height', graphHeight).attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    yAxisGraph.current = graph.current.append('g')
    xAxisGraph.current = graph.current.append('g').attr('transform', `translate(0,${SVG_HEIGHT - MARGIN.bottom})`)
    y.current = d3.scaleLinear().range([MAX_RANGE_Y, 0])
    x.current = d3.scaleBand().range([0, MAX_RANGE_X]).paddingInner(0.2).paddingOuter(0.2)
  }, [])

  function update(data) {
    const maxHeight = d3.max(data, r => r.orders)
    y.current.domain([0, maxHeight])
    x.current.domain(data.map(d => d.name))

    const rect = graph.current.selectAll('rect').data(data)

    rect.exit().remove()

    rect
      .attr('width', x.current.bandwidth())
      .attr('fill', 'orange')
      .attr('x', d => x.current(d.name))
      .transition().duration(500)
        .attr('y', d => y.current(d.orders))
        .attr('height', d => graphHeight - y.current(d.orders) + MARGIN.top)

    rect.enter().append('rect')
      .attr('width', x.current.bandwidth())
      .attr('fill', 'orange')
      .attr('x', d => x.current(d.name))
      .attr('y', d => graphHeight)
      .attr('height', d => 0)
      .transition().duration(500)
        .attr('y', d => y.current(d.orders))
        .attr('height', d => graphHeight - y.current(d.orders) + MARGIN.top)

    const yAxis = d3.axisLeft(y.current).ticks(3).tickFormat(d => `${d} orders`)
    const xAxis = d3.axisBottom(x.current)

    yAxisGraph.current.call(yAxis)
    xAxisGraph.current.call(xAxis)

    xAxisGraph.current.selectAll('text')
      .attr('transform', `rotate(-40)`)
      .attr('text-anchor', 'end')
  }


  useEffect(() => {
    onSnapshot(collection(db, 'dishes'), snapshot => {
      snapshot.docChanges().forEach(change => {
        switch (change.type) {
          case 'added':
            const newItem = { ...change.doc.data(), id: change.doc.id }
            rects.current = [...rects.current, newItem]
            break
          case 'modified':
            rects.current = rects.current.map(rect => rect.id === change.doc.id
              ? { ...change.doc.data(), id: change.doc.id }
              : rect
            )
            break
          case 'removed':
            rects.current = rects.current.filter(d => d.id !== change.doc.id)
          default:
            break
        }
      })
      update(rects.current)
    })
  }, [])

  return <div ref={canvasRef} className='test'></div>
}

export default D3js





