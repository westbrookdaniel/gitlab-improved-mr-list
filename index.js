// Run on any gitlab page
if (/^https:\/\/gitlab\.*.*\/?$/.test(window.location.href)) {
  // Find any mention of :https://example.com/image.png: and replace it with the image inline (like a custom emoji)
  document
    .querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span')
    .forEach((element) => {
      if (
        element.innerHTML.includes(
          ':<a rel="nofollow noreferrer noopener" href='
        )
      ) {
        // Replace link child with image
        Array.from(element.children).find((child) => {
          if (child.tagName === 'A') {
            const url = child.href
            const img = document.createElement('img')
            img.src = url
            // Try and make it look like a custom emoji
            img.style.maxWidth = '100%'
            img.style.maxHeight = '100%'
            img.style.height = '2em'
            img.style.objectFit = 'contain'
            img.style.margin = '0 auto'
            img.style.display = 'inline-block'
            // Used for identifying the element later
            img.classList.add('_custom_emoji')
            child.replaceWith(img)
          }
        })

        // Remove the ":" on both sides
        element.childNodes.forEach((child, i, arr) => {
          // If just before or after our image
          const nextItem = arr[i + 1]
          if (nextItem?.classList?.contains?.('_custom_emoji')) {
            // only replace last :
            child.textContent = child.textContent.replace(/:$/, '')
          }
          const prevItem = arr[i - 1]
          if (prevItem?.classList?.contains?.('_custom_emoji')) {
            // only replace first :
            child.textContent = child.textContent.replace(/^:/, '')
          }
        })
      }
    })
}

// Only run if on a gitlab merge request page
if (
  /^https:\/\/gitlab\.*.*\/merge_requests\/?(\?.*)?$/.test(window.location.href)
) {
  function createUserIcon(id, user) {
    // Check if it already exists
    document.getElementById(id) && document.getElementById(id).remove()

    const img = document.createElement('img')
    img.id = id
    img.width = '24'
    img.classList.add('avatar', 'avatar-inline')
    img.style.marginTop = '4px'
    img.style.marginRight = '10px'
    img.style.width = '24px'
    img.style.height = '24px'
    img.loading = 'lazy'

    if (user) {
      img.src = user.avatar_url
    }

    return img
  }

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

    li.append(span)
    return li
  }

  // For each merge request (using index as id)
  document.querySelectorAll('.merge-request').forEach((element, id) => {
    // Ids for elements
    const uid = id + 'user'
    const tid = id + 'threads'

    // Adjust the side padding because we're gonna add an avatar
    element.style.paddingLeft = '4px'
    element.style.paddingRight = '4px'

    const anchor = element.querySelector('.merge-request-title-text a')
    const author = element.querySelector('.author-link')
    const authorUsername = author.href.split('/').pop()
    const metaList = element.querySelector('.issuable-meta ul')

    // Create loading placeholders
    element.prepend(createUserIcon(uid))
    metaList.append(createThreadsBadge(tid, '#e3e3e3'))

    // Add a profile picture for the author of the MR
    fetch(`/api/v4/users?username=${authorUsername}`)
      .then((res) => res.json())
      .then((res) => {
        const user = res[0]
        if (!user) return

        element.prepend(createUserIcon(uid, user))
      })

    // Add a threads resolved / threads unresolved indicator
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
          metaList.append(createThreadsBadge(tid, red, resolved, resolvable))
        } else if (resolved === resolvable && resolvable > 0) {
          // All Resolved
          const green = '#108548'
          metaList.append(createThreadsBadge(tid, green, resolved, resolvable))
        } else {
          // No threads
          const gray = '#737278'
          metaList.append(createThreadsBadge(tid, gray, resolved, resolvable))
        }
      })

    // Remove the task status text
    const taskStatusElement = element.querySelector('.task-status')
    if (taskStatusElement) {
      taskStatusElement.remove()
    }
  })
}
