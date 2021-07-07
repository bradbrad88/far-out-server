const mapValues = data => {
  return `(${data.map(item => item)})`;
};

const mapValueSets = data => {
  return `${data.map(item => {
    return `(${item.map(el => {
      return `'${el}'`;
    })})`.toString();
  })}`;
};

const mapSetOfObjects = data => {
  return `${data.map(item => {
    return `(${Object.keys(item).map(key => {
      return `'${item[key]}'`;
    })})`;
  })}`;
};

const mapSetOfObjectsWithId = (id, data) => {
  return `${data.map(item => {
    return `(${id}, ${Object.keys(item).map(key => {
      return `'${item[key]}'`;
    })})`;
  })}`;
};
exports.user = {
  getUserByLocalId: user_id => {
    return {
      text: `
      SELECT 
        user_id
      , given_name
      , family_name
      , email
      , image_url
      , admin
      FROM users
      WHERE user_id = $1`,
      values: [user_id],
    };
  },

  upsertUserGoogle: user => {
    return {
      text: `
        INSERT INTO users
        (given_name, family_name, email, image_url, google_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (google_id)
          DO UPDATE SET google_id=users.google_id, given_name=EXCLUDED.given_name, family_name=EXCLUDED.family_name, email=EXCLUDED.email, image_url=EXCLUDED.image_url
        RETURNING user_id, given_name, family_name, email, image_url, google_id, admin`,
      values: [
        user.given_name,
        user.family_name,
        user.email,
        user.picture,
        user.sub,
      ],
    };
  },
};

// exports.getUserByLocalId = user_id => {
//   return {
//     text: `
//     SELECT
//       user_id
//     , given_name
//     , family_name
//     , email
//     , image_url
//     , admin
//     FROM users
//     WHERE user_id = $1`,
//     values: [user_id],
//   };
// };

// exports.upsertUserGoogle = user => {
//   return {
//     text: `
//       INSERT INTO users
//       (given_name, family_name, email, image_url, google_id, user_state)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       ON CONFLICT (google_id)
//         DO UPDATE SET google_id=users.google_id, given_name=EXCLUDED.given_name, family_name=EXCLUDED.family_name, email=EXCLUDED.email, image_url=EXCLUDED.image_url, user_state=EXCLUDED.user_state
//       RETURNING user_id, given_name, family_name, email, image_url, google_id, admin`,
//     values: [
//       user.givenName,
//       user.familyName,
//       user.email,
//       user.imageUrl,
//       user.googleId,
//       user.state,
//     ],
//   };
// };

exports.gallery = {
  get: () => {
    return `
    SELECT 
      g.image_id,
      image_desc,
      extract(epoch from date_uploaded) as date_uploaded,
      likes,
      url,
      emphasize,
      display_order,
      complete
    FROM image_gallery g INNER JOIN image_urls u ON g.image_id = u.image_id
    INNER JOIN image_display d ON g.image_id = d.image_id
    WHERE u.resolution = 'thumbnail'`;
  },

  delete: image_ids => {
    return {
      text: `DELETE FROM image_gallery
      WHERE image_id IN ${mapValues(image_ids)};`,
    };
  },
  getInactive: () => {
    return `
    SELECT 
      g.image_id,
      image_desc,
      extract(epoch from date_uploaded) as date_uploaded,
      url,
      complete
    FROM image_gallery g LEFT JOIN image_urls u ON g.image_id = u.image_id
    LEFT JOIN image_display d ON g.image_id = d.image_id
    WHERE (u.resolution = 'thumbnail' OR u.resolution IS NULL) AND d.image_id IS NULL
    ORDER BY date_uploaded DESC`;
  },
  getAllImageThumbnails: () => {
    return `
    SELECT
      g.image_id,
      extract(epoch from date_uploaded) as date_uploaded,
      url
    FROM image_gallery g INNER JOIN image_urls u ON g.image_id = u.image_id
    WHERE u.resolution = 'thumbnail' AND complete = true
    ORDER BY date_uploaded DESC`;
  },
  setDisplay: displayData => {
    const values = mapSetOfObjects(displayData);
    const test = `
    DELETE FROM image_display *;
    INSERT INTO image_display (image_id, emphasize, display_order)
    VALUES ${values}`;
    return test;
  },
  setComplete: image_id => {
    return {
      text: `
    UPDATE image_gallery
    SET complete = true
    WHERE image_id = $1`,
      values: [image_id],
    };
  },
  newImage: (desc, user) => {
    return {
      text: `INSERT INTO image_gallery (image_desc, uploaded_by) VALUES ($1, $2) RETURNING image_id`,
      values: [desc, user],
    };
  },
  addUrls: data => {
    const values = mapValueSets(data);
    return `
    INSERT INTO image_urls (image_id, url, aws_key, bucket, resolution) 
    VALUES ${values}`;
  },
  getAwsKeys: () => {
    return `
    SELECT aws_key
    FROM image_urls`;
  },
  deleteDisplay: () => {
    return `
    DELETE FROM image_display *`;
  },
  getColumnOptions: () => {
    return `
    SELECT
      gallery_columns
    FROM gallery_settings`;
  },
  removeStaleImages: () => {
    return `
    DELETE FROM image_gallery
    WHERE complete=false AND date_uploaded < now() - INTERVAL '20 seconds'`;
  },
};

exports.blog = {
  newBlog: blog => {
    return {
      text: `
        INSERT INTO blogs (
          title,
          image,
          blog_desc,
          html)
        VALUES ($1, $2, $3, $4)
        RETURNING blog_id`,
      values: [blog.title, blog.image, blog.description, blog.html],
    };
  },
  editBlog: blog => {
    return {
      text: `
        UPDATE blogs
        SET 
          title=$2,
          html=$3,
          image=$4,
          blog_desc=$5
        WHERE blog_id=$1
      `,
      values: [blog.blog_id, blog.title, blog.html, blog.image, blog.description],
    };
  },
  getActiveBlogs: () => {
    return `
    SELECT
      blog_id,
      title,
      date_created,
      blog_desc,
      t.url AS thumbnail,
      h.url AS highres,
      active
    FROM blogs b  LEFT JOIN image_thumbnails t ON b.image = t.image_id
    LEFT JOIN image_highres h ON b.image = h.image_id
    WHERE active=true
    ORDER BY date_created DESC`;
  },
  getAllBlogs: () => {
    return `
    SELECT
      blog_id,
      title,
      date_created,
      blog_desc,
      t.url AS thumbnail,
      h.url AS highres,
      active
    FROM blogs b  LEFT JOIN image_thumbnails t ON b.image = t.image_id
    LEFT JOIN image_highres h ON b.image = h.image_id
    ORDER BY date_created DESC`;
  },
  getBlog: blog_id => {
    return {
      text: `
        SELECT
          blog_id,
          title,
          image,
          blog_desc,
          html,
          extract(epoch FROM date_created) as date_created,
          extract(epoch FROM last_modified) as last_modified,
          active,
          t.url as thumbnail,
          h.url as highres
        FROM blogs b LEFT JOIN image_thumbnails t ON b.image = t.image_id
        LEFT JOIN image_highres h ON b.image = h.image_id 
        WHERE blog_id=($1)`,
      values: [blog_id],
    };
  },
  setActive: (blog_id, active) => {
    return {
      text: `
      UPDATE blogs
      SET active=$2
      WHERE blog_id=$1`,
      values: [blog_id, active],
    };
  },
  deleteBlog: blog_id => {
    return {
      text: `DELETE FROM blogs
      WHERE blog_id=$1`,
      values: [blog_id],
    };
  },
  setImageUrls: (blog_id, images) => {
    const values = mapSetOfObjectsWithId(blog_id, images);
    return `
      DELETE FROM image_urls
      WHERE blog_id=${blog_id};
      INSERT INTO image_urls (blog_id, aws_key, url, bucket)
      VALUES ${values}`;
  },
};

exports.comments = {
  newComment: (user, comment) => ({
    text: `
      INSERT INTO user_comments (user_id, blog_id, image_id, comment_body, parent_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING comment_id`,
    values: [
      user.user_id,
      comment.blog_id,
      comment.image_id,
      comment.body,
      comment.parent_id,
    ],
  }),
  getImage: image_id => ({
    text: `
      SELECT 
        comment_id,
        image_id,
        c.user_id,
        u.given_name,
        u.family_name,
        u.image_url,
        comment_body,
        EXTRACT(epoch from date_created) as date_created,
        parent_id
      FROM user_comments c LEFT JOIN users u ON c.user_id=u.user_id
      WHERE image_id=$1`,
    values: [image_id],
  }),
};
