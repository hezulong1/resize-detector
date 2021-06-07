import ResizeObserver from 'resize-observer-polyfill'
import raf from 'raf'
import { mediaQueries } from 'container-query-toolkit'
import { isPlainObject } from './types'

const _default = {
  name: 'ProContainerQuery',
  props: {
    disabled: Boolean,
    query: {
      type: Object,
      require: true
    }
  },
  data() {
    this.currentElement = null
    this.resizeObserver = null
    this.nextAnimationFrame = null
    return {
      width: 0,
      height: 0
    }
  },
  computed: {
    mediaQueries() {
      return isPlainObject(this.query) ? () => ({}) : mediaQueries(this.query)
    }
  },
  mounted() {
    this.onComponentUpdated()
  },
  updated() {
    this.onComponentUpdated()
  },
  beforeDestroy() {
    this.destroyObserver()
  },
  methods: {
    onComponentUpdated() {
      const { disabled } = this.$props

      // Unregister if disabled
      if (disabled) {
        this.destroyObserver()
        return
      }

      // Unregister if element changed
      const element = this.$el
      const elementChanged = element !== this.currentElement
      if (elementChanged) {
        this.destroyObserver()
        this.currentElement = element
      }

      if (!this.resizeObserver && element) {
        this.resizeObserver = new ResizeObserver(entries => {
          this.nextAnimationFrame = raf(() => this.onResize(entries))
        })
        this.resizeObserver.observe(element)
      }
    },
    onResize(entries) {
      const { target } = entries[0]
      const { width, height } = target.getBoundingClientRect()
      const fixedWidth = Math.floor(width)
      const fixedHeight = Math.floor(height)

      if (this.width !== fixedWidth || this.height !== fixedHeight) {
        const size = { width: fixedWidth, height: fixedHeight }
        this.width = fixedWidth
        this.height = fixedHeight

        const result = this.mediaQueries(size)
        this.$emit('resize', result, size)
      }
    },
    destroyObserver() {
      raf.cancel(this.nextAnimationFrame)

      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }
    }
  },
  render() {
    return this.$slots.default[0]
  }
}

export default _default
