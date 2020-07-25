import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { FixedSizeList as List } from 'react-window';
// import {InfiniteLoader, List, WindowScroller, AutoSizer} from 'react-virtualized';
import InfiniteLoader from 'react-window-infinite-loader';
// import { WindowScroller, AutoSizer } from "react-virtualized";
import MovieCard from '../containers/MovieCard';

const ITEM_WIDTH = 400;
const ITEM_HEIGHT = 360;

const styles = theme => ({
  grid: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    justifyContent: 'center',
  },
  gridItem: {
    width: ITEM_WIDTH,
    padding: 1.5 * theme.spacing.unit,
  },
  card: {
    height: '100%',
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  }
});

function generateIndexesForRow(rowIndex, maxItemsPerRow, itemsAmount) {
  const result = [];
  const startIndex = rowIndex * maxItemsPerRow;

  for (let i = startIndex; i < Math.min(startIndex + maxItemsPerRow, itemsAmount); i++) {
    result.push(i);
  }

  return result;
}

function getMaxItemsAmountPerRow(width) {
  return Math.max(Math.floor(width / ITEM_WIDTH), 1);
}

function getRowsAmount(width, itemsAmount, hasMore) {
  const maxItemsPerRow = getMaxItemsAmountPerRow(width);

  return Math.ceil(itemsAmount/ maxItemsPerRow) + (hasMore ? 1 : 0);
}

const RowItem = React.memo(function RowItem({movieId, classes}) {
  return (
    <Grid item className={classes.gridItem} key={movieId}>
      <MovieCard id={movieId} classes={{root: classes.card}} />
    </Grid>
  );
});



class InfiniteMoviesList extends React.PureComponent {
  infiniteLoaderRef = React.createRef();

  loadMoreItems = () => {
    if (!this.props.isFetching) {
      this.props.fetchMovies();
    }
  };

  noItemsRenderer = () => (
    <Grid item>
      <Typography>No movies found</Typography>
    </Grid>
  );

  componentDidUpdate(prevProps) {
    if (!prevProps.reset && this.props.reset && this.infiniteLoaderRef.current) {
      this.infiniteLoaderRef.current.resetloadMoreItemsCache(true);
    }
  }

  render() {
    const {classes} = this.props;
    const width = 0.85 * window.innerWidth;
    const height = window.innerHeight;
    const {movies, hasMore} = this.props;
    const rowCount = getRowsAmount(width, movies.length, hasMore);
    const rowRenderer = ({index, style}) => {
      const {movies, classes} = this.props;
      const maxItemsPerRow = getMaxItemsAmountPerRow(width);
      const moviesIds = generateIndexesForRow(index, maxItemsPerRow, movies.length).map(movieIndex => movies[movieIndex]);
    
      return (
        <div style={style} className={classes.row}>
          {moviesIds.map(movieId => (
            <RowItem key={movieId} movieId={movieId} classes={classes}/>
          ))}
        </div>
      )
    };

    return (
              <InfiniteLoader
                ref={this.infiniteLoaderRef}
                itemCount={rowCount}
                isItemLoaded={index => {
                  const {hasMore, movies} = this.props;
                  const maxItemsPerRow = getMaxItemsAmountPerRow(width);
                  const allItemsLoaded = generateIndexesForRow(index, maxItemsPerRow, movies.length).length > 0;

                  return !hasMore || allItemsLoaded;
                }}
                loadMoreItems={this.loadMoreItems}
              >
                {({onItemsRendered, ref}) => (
                  <section>
                      <List
                        className={classes.grid}
                        ref={ref}
                        height={height}
                        width={width}
                        itemCount={rowCount}
                        itemSize={ITEM_HEIGHT}
                        onItemsRendered={onItemsRendered}
                        noItemsRenderer={this.noItemsRenderer}
                      >
                      {rowRenderer}
                      </List>
                    </section>
                )}
              </InfiniteLoader>
       );
    }
};

InfiniteMoviesList.defaultProps = {
  movies: [],
  isFetching: false,
  hasMore: false,
  reset: false,
  fetchMovies: () => {},
};

InfiniteMoviesList.propTypes = {
  movies: PropTypes.arrayOf(PropTypes.number.isRequired),
  fetchMovies: PropTypes.func,
  hasMore: PropTypes.bool,
  isFetching: PropTypes.bool,
  reset: PropTypes.bool,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(InfiniteMoviesList);
