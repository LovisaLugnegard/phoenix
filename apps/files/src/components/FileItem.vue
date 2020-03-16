<template>
  <oc-file
    :name="fileName"
    :extension="item.extension"
    :icon="fileTypeIcon"
    :iconUrl="previewUrl"
    :filename="item.name"
    />
</template>
<script>
import queryString from 'query-string'
import fileTypeIconMappings from '../fileTypeIconMappings.json'

export default {
  name: 'FileItem',
  props: {
    /**
         * The html element used for the avatar container.
         * `div, span`
         */
    item: {
      type: Object
    },
    davUrl: {
      type: String
    },
    showPath: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      previewUrl: this.item.previewUrl
    }
  },
  computed: {
    fileName () {
      if (this.showPath) {
        const pathSplit = this.item.path.substr(1).split('/')
        if (pathSplit.length === 2) return `${pathSplit[pathSplit.length - 2]}/${this.item.basename}`
        if (pathSplit.length > 2) return `…/${pathSplit[pathSplit.length - 2]}/${this.item.basename}`
      }
      return this.item.basename
    },
    // FIXME: duplicate in mixin
    fileTypeIcon () {
      if (this.item.type === 'folder') {
        return 'folder'
      }
      const icon = fileTypeIconMappings[this.item.extension]
      if (icon) return `${icon}`
      return 'x-office-document'
    }
  },
  mounted () {
    this.loadPreview()
  },
  methods: {
    loadPreview () {
      if (this.item.previewUrl) {
        this.previewUrl = this.item.previewUrl
        return
      }

      // TODO: check if previews are globally enabled (requires capability entry)
      // don't load previews for pending or rejected shares (status)
      if (!this.davUrl || this.item.type === 'folder' || (typeof this.item.status !== 'undefined' && this.item.status !== 0)) {
        return
      }
      const query = queryString.stringify({
        x: this.thumbDimensions,
        y: this.thumbDimensions,
        c: this.item.etag,
        scalingup: 0,
        preview: 1,
        a: 1
      })

      const previewUrl = this.davUrl + '/' + this.item.path + '?' + query
      this.mediaSource(previewUrl, 'url', this.requestHeaders).then(dataUrl => {
        // cache inside item
        this.previewUrl = this.item.previewUrl = dataUrl
      })
    }
  }
}
</script>
