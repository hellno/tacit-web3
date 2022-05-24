import blockies from 'ethereum-blockies'
import { Component, createElement } from 'react'

class BlockiesComponent extends Component {
  getOpts () {
    return {
      seed: this.props.opts.seed,
      // bgcolor: this.props.opts.bgcolor || '#000',
      // color: this.props.opts.color || '#FFF',
      size: this.props.opts.size || 64,
      scale: this.props.opts.scale || 32
      // spotcolor: this.props.opts.spotcolor || '#FACC15'
    }
  }

  componentDidMount () {
    this.draw()
  }

  draw () {
    blockies.render(this.getOpts(), this.canvas)
  }

  render () {
    return <div className="flex h-12 w-12 rounded-full overflow-hidden">
      {/* eslint-disable-next-line no-return-assign */}
      {createElement('canvas', { ref: canvas => this.canvas = canvas })}
    </div>
  }
}

export default BlockiesComponent
