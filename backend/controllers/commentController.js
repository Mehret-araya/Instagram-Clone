import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
// Delete Comment
export const deleteComment = async (req, res) => {
  try {

    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    comment.deleteOne();

    await post.save();

    res.status(200).json({
      message: "Comment deleted successfully",
      comments: post.comments,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
export const addReply = async (req,res)=>{

try{

const {text}=req.body;


const post = await Post.findById(req.params.postId);


if(!post){

return res.status(404).json({
message:"Post not found"
});

}


const comment = post.comments.id(
req.params.commentId
);


if(!comment){

return res.status(404).json({
message:"Comment not found"
});

}


comment.replies.push({

user:req.user._id,

text

});


await post.save();


res.status(201).json({

message:"Reply added successfully",

comments:post.comments

});


}catch(error){

res.status(500).json({
message:error.message
});

}

};

// Add Reply
export const addReply = async (req, res) => {
  try {

    const { postId, commentId } = req.params;
    const { text } = req.body;


    const post = await Post.findById(postId);


    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }


    const comment = post.comments.id(commentId);


    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }


    comment.replies.push({
      user: req.user._id,
      text,
    });


    await post.save();


    res.status(201).json({
      message: "Reply added successfully",
      replies: comment.replies,
    });


  } catch(error){

    res.status(500).json({
      message:error.message,
    });

  }
};

// Add Comment
export const addComment = async (req, res) => {
  try {

    const { text } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.comments.push({
      user: req.user._id,
      text,
    });

    await post.save();


// Create comment notification

if(post.user.toString() !== req.user._id.toString()){


    await Notification.create({

        receiver: post.user,

        sender: req.user._id,

        type:"comment",

        post:post._id,

        message:"Someone commented on your post"

    });

}

   res.status(201).json({
      message: "Comment added successfully",
      comments: post.comments,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};