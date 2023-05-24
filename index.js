// Only run if on a gitlab merge request page
if (
  /^https:\/\/gitlab\.*.*\/merge_requests\/?(\?.*)?$/.test(window.location.href)
) {
  // Util for adding a badge to the merge request
  function createThreadsBadge(id, color, resolved, resolvable) {
    // Check if it already exists
    document.getElementById(id) && document.getElementById(id).remove()

    const div = document.createElement('div')
    div.classList.add('issuable-comments', 'd-none', 'd-sm-flex')
    div.id = id

    const span = document.createElement('span')
    span.classList.add('badge', 'color-label')
    span.style.backgroundColor = color
    span.style.color = '#333238'
    span.style.minWidth = '40px'
    span.style.padding = '1px 2px'
    span.style.marginBottom = '1px'

    if (resolved === undefined || resolvable === undefined) {
      span.innerText = '...'
    } else {
      span.innerText = `${resolved}/${resolvable}`
    }

    div.prepend(span)
    return div
  }

  // For each merge request (using index as id)
  document.querySelectorAll('.merge-request').forEach((element, id) => {
    const anchor = element.querySelector('.merge-request-title-text a')
    const metaList = element.querySelector('.issuable-meta ul')

    // Create loading placeholder
    const gray = '#e3e3e3'
    metaList.append(createThreadsBadge(id, gray))

    // Fetch it's discussions
    fetch(`${anchor.href}/discussions.json`)
      .then((res) => res.json())
      .then((res) => {
        // Find the number of resolvable and resolved threads
        let resolvable = 0
        let resolved = 0
        res.forEach((item) => {
          if (item.resolvable) resolvable++
          if (item.resolved) resolved++
        })

        // Add a badge to the merge request
        if (resolvable > resolved) {
          // Not resolved
          const red = 'var(--red-100, #fdd4cd)'
          metaList.append(createThreadsBadge(id, red, resolved, resolvable))
        } else if (resolved === resolvable && resolvable > 0) {
          // All Resolved
          const green = 'var(--green-100, #c3e6cd)'
          metaList.append(createThreadsBadge(id, green, resolved, resolvable))
        } else {
          // No threads
          const gray = '#e3e3e3'
          metaList.append(createThreadsBadge(id, gray, resolved, resolvable))
        }
      })
  })
}
