import Message from "../components/Message";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { toast } from "react-toastify";
import {
	arrayUnion,
	doc,
	getDoc,
	onSnapshot,
	Timestamp,
	updateDoc,
} from "firebase/firestore";

const Details = () => {
	const route = useRouter();
	const routeData = route.query;
	const [comment, setComment] = useState("");
	const [allComments, setAllComments] = useState([]);

	// Submit a comment
	const submitComment = async () => {
		// Check if user is logged in
		if (!auth.currentUser) return route.push("/auth/login");
		if (!comment) {
			toast.error("Comment field empty", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 1500,
			});
			return;
		}
		const docRef = doc(db, "posts", routeData.id);
		await updateDoc(docRef, {
			comments: arrayUnion({
				comment,
				avatar: auth.currentUser.photoURL,
				username: auth.currentUser.displayName,
				time: Timestamp.now(),
			}),
		});
		setComment("");
	};

	// Get comments
	const getComments = async () => {
		const docRef = doc(db, "posts", routeData.id);
		const unsubscribe = onSnapshot(docRef, (snapshot) => {
			setAllComments(snapshot.data().comments);
		});
		return unsubscribe;
	};

	useEffect(() => {
		if (!route.isReady) return;
		getComments();
	}, [route.isReady]);

	return (
		<div>
			<Message {...routeData}></Message>
			<div className="my-4">
				<div className="flex gap-2">
					<input
						onChange={(e) => setComment(e.target.value)}
						type="text"
						value={comment}
						placeholder="Leave a comment"
						className="bg-gray-800 w-full p-2 text-white rounded-lg text-sm"
					/>
					<button
						onClick={submitComment}
						className="bg-cyan-500 text-white py-2 px-4 rounded-lg text-sm"
					>
						Submit
					</button>
				</div>
				<div className="py-6">
					<h2 className="font-bold">Comments</h2>
					{allComments?.map((comment) => (
						<div
							className="bg-white p-4 my-4 border-2 rounded-lg"
							key={comment.time}
						>
							<div className="flex items-center gap-2 mb-4">
								<img
									className="w-10 rounded-full"
									src={comment.avatar}
									alt={`${comment.username} avatar`}
								/>
								<h2>{comment.username}</h2>
							</div>
							<h2>{comment.comment}</h2>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Details;
