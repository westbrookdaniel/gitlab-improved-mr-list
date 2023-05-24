// Only run if on a gitlab merge request page
if (
  /^https:\/\/gitlab\.*.*\/merge_requests\/?(\?.*)?$/.test(window.location.href)
) {
  // Util for adding a badge to the merge request
  function createThreadsBadge(id, color, resolved, resolvable) {
    // Check if it already exists
    document.getElementById(id) && document.getElementById(id).remove()

    const li = document.createElement('div')
    li.classList.add('issuable-comments', 'd-none', 'd-sm-flex')
    li.id = id
    li.style.textAlign = 'center'

    const span = document.createElement('span')
    span.style.color = color
    span.style.minWidth = '20px'

    if (resolved === undefined || resolvable === undefined) {
      span.innerText = '...'
    } else {
      span.innerText = `${resolved}/${resolvable}`
    }

    li.prepend(span)
    return li
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
          const red = '#dd2b0e'
          metaList.append(createThreadsBadge(id, red, resolved, resolvable))
        } else if (resolved === resolvable && resolvable > 0) {
          // All Resolved
          const green = '#108548'
          metaList.append(createThreadsBadge(id, green, resolved, resolvable))
        } else {
          // No threads
          const gray = '#737278'
          metaList.append(createThreadsBadge(id, gray, resolved, resolvable))
        }
      })
  })
}
