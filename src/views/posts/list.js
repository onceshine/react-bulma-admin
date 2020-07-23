import React from 'react'
import { useRouteMatch, Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import { usePaginatedQuery, queryCache } from 'react-query'

import Pagination from '@/components/pagination'

import { pageSize } from '@/config'

function Item({ item }) {
  let match = useRouteMatch()
  return (
    <tr>
      <td>{item.id}</td>
      <td><Link to={`${match.path}/${item.id}`}>{item.title}</Link></td>
      <td>{item.user?.name}</td>
      <td>{item.comments.length}</td>
      <td>
        <div className="buttons">
          <a onClick={() => getPost(item.id)} className="button is-small is-primary" href="#">
            <span className="icon is-small">
              <i className="fa fa-edit"></i>
            </span>
          </a>
          <a onClick={() => delPost(item)} className="button is-small is-danger" href="#">
            <span className="icon is-small">
              <i className="fa fa-times"></i>
            </span>
          </a>
        </div>
      </td>
    </tr>
  )
}

export default function Index(props) {
  const [page, setPage] = React.useState(1)
  const fetchPosts = React.useCallback(async (key, page = 1) => {
    let { headers, data } = await axios.get(
        `/posts?_embed=comments&_expand=user&_page=${page}`)
    return {
      posts: data,
      totalPage: Math.ceil(headers['x-total-count'] / pageSize)
    }
  }, [])

  const {
    status,
    resolvedData,
    latestData,
    error,
    isFetching
  } = usePaginatedQuery(['posts', page], fetchPosts, {})

  React.useEffect(() => {
    if (page < latestData?.totalPage) {
      queryCache.prefetchQuery(['posts', page + 1], fetchPosts)
    }
  }, [latestData, fetchPosts, page])

  return (
<>
  <nav className="breadcrumb" aria-label="breadcrumbs">
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><a href="../">Posts</a></li>
      <li className="is-active"><a href="#" aria-current="page">List</a></li>
    </ul>
  </nav>
  <nav className="level">
    <div className="level-left">
      <div className="level-item">
        <p className="subtitle is-5">
          <strong>49</strong> posts
        </p>
      </div>
      <div className="level-item">
        <div className="field has-addons">
          <p className="control">
            <input className="input" type="text" placeholder="Find a post"/>
          </p>
          <p className="control">
            <button className="button">
              Search
            </button>
          </p>
        </div>
      </div>
    </div>

    <div className="level-right">
      <p className="level-item"><strong>All</strong></p>
      <p className="level-item"><a>Published</a></p>
      <p className="level-item"><a>Drafts</a></p>
      <p className="level-item"><a>Deleted</a></p>
      <p className="level-item">
        <Link className="button is-success" to="/posts/add">New</Link>
        </p>
    </div>
  </nav>

  <div className="content">
    {status === 'loading' ? (
      <div>Loading...</div>
    ) : status === 'error' ? (
      <div>{error.message}</div>
    ) : <table className="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Name</th>
          <th>Comments</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {resolvedData.posts.map((item) => (
          <Item item={item} key={item.id}/>
        ))}
      </tbody>
    </table>}

    
  </div>
  <div className="columns">
    <div className="column">
      <div className="has-text-primary">Showing 1 to 10 of 49 entries</div>
    </div>
    <div className="column">
      <div className="is-centered">
        <Pagination
          page={page}
          setPage={setPage}
          totalPage={latestData?.totalPage ?? 1}/>
      </div>
    </div>
  </div>
</>
  )
}
