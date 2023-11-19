import * as d3 from 'd3'
import { useEffect, useRef, useState } from 'react'
import db from './firestore';
import { onSnapshot, collection } from "firebase/firestore";


const MAX_RANGE_Y = 500
const MAX_RANGE_X = 500
const SVG_WIDTH = 600
const SVG_HEIGHT = 600
const MARGIN = { top: 20, right: 20, left: 100, bottom: 100 }
const y = d3.scaleLinear().range([MAX_RANGE_Y, 0])
const x = d3.scaleBand().range([0, MAX_RANGE_X]).paddingInner(0.2).paddingOuter(0.2)
const graphWidth = SVG_WIDTH - MARGIN.left - MARGIN.right
const graphHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom



function D3() {
  const yAxisRef = useRef()
  const xAxisRef = useRef()
  const [rects, setRects] = useState([])

  const maxHeight = d3.max(rects, r => r.orders)

  y.domain([0, maxHeight])
  x.domain(rects.map(d => d.name))

  const yAxis = d3.axisLeft(y).ticks(3).tickFormat(d => `${d} orders`)
  const xAxis = d3.axisBottom(x)

  useEffect(() => {
    onSnapshot(collection(db, 'dishes'), snapshot => {
      snapshot.docChanges().forEach(change => {
        switch (change.type) {
          case 'added':
            const newItem = { ...change.doc.data(), id: change.doc.id }
            setRects(rects => [...rects, newItem])
            break
          case 'modified':
            setRects(rects => rects.map(rect => rect.id === change.doc.id
              ? { ...change.doc.data(), id: change.doc.id }
              : rect
            ))
            break
          case 'removed':
            setRects(rects => rects.filter(d => d.id !== change.doc.id))
          default:
            break
        }
      })
    })
  }, [])


  useEffect(() => {
    d3.select(yAxisRef.current).call(yAxis)
    d3.select(xAxisRef.current).call(xAxis)
      .selectAll('text')
      .attr('transform', `rotate(-40)`)
      .attr('text-anchor', 'end')
  }, [yAxis, xAxis])

  const t = d3.transition().duration(5000)

  function widthTween() {
    const i = d3.interpolate(0, x.bandwidth())

    return function(t) {
      return i(t)
    }
  }

  useEffect(() => {
    console.log(rects)
    const rectsSelection = d3.select('.rectsGroup').selectAll('rect').data(rects)

    rectsSelection.exit().remove()

    rectsSelection
      .attr('width', x.bandwidth())
      .attr('fill', 'orange')
      .attr('x', d => x(d.name))
      .transition(t)
        .attr('y', d => y(d.orders))
        .attr('height', d => graphHeight - y(d.orders) + MARGIN.top)

    rectsSelection.enter().append('rect')
      .attr('fill', 'orange')
      .attr('x', d => x(d.name))
      .attr('y', () => graphHeight + MARGIN.top)
      .attr('height', () => 0)
      .transition(t)
        .attrTween('width', widthTween)
        .attr('y', d => y(d.orders))
        .attr('height', d => graphHeight - y(d.orders) + MARGIN.top)

  }, [rects, x, y, graphHeight])

  return <svg width={`${SVG_WIDTH}`} height={`${SVG_HEIGHT}`}>
    <g
      className='rectsGroup'
      width={`${graphWidth}`}
      height={`${graphHeight}`}
      transform={`translate(${MARGIN.left},${MARGIN.top})`}
    >
      <g ref={yAxisRef}></g>
      <g ref={xAxisRef} transform={`translate(0,${SVG_HEIGHT - MARGIN.bottom})`}></g>
    </g>

  </svg>
}

export default D3

