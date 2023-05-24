// Only run if on a gitlab merge request page
if (
  /^https:\/\/gitlab\.*.*\/merge_requests\/?(\?.*)?$/.test(window.location.href)
) {
  // Util for adding a badge to the merge request
  function createThreadsBadge(element, color, resolved, resolvable) {
    const li = document.createElement('li')
    li.classList.add('issuable-comments', 'd-none', 'd-sm-flex')

    const span = document.createElement('span')
    span.classList.add('badge', 'color-label')
    span.style.backgroundColor = color
    span.style.color = '#333333'
    span.innerText = `${resolved}/${resolvable} threads resolved`

    li.prepend(span)
    element.prepend(li)
  }

  // For each merge request
  document.querySelectorAll('.merge-request').forEach((element) => {
    const anchor = element.querySelector('.merge-request-title-text a')
    const metaList = element.querySelector('.issuable-meta ul')

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
          createThreadsBadge(metaList, '#ffd3d3', resolved, resolvable)
        } else if (resolved === resolvable && resolvable > 0) {
          createThreadsBadge(metaList, '#8fc7a6', resolved, resolvable)
        }
      })
  })
}
