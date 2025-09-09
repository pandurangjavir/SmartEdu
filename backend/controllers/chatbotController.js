const axios = require('axios');

async function sendMessage(req, res) {
	try {
		const { message } = req.body;
		const { id, role, table } = req.user; // From JWT middleware
		
		if (!message) {
			return res.status(400).json({ msg: 'Message is required' });
		}

		// Forward message to Rasa with user context
		const rasaResponse = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
			sender: `user_${id}`,
			message: message,
			metadata: {
				user_id: id,
				user_role: role,
				user_table: table
			}
		});

		// Get the response from Rasa
		const botResponse = rasaResponse.data[0]?.text || 'Sorry, I didn\'t understand that.';

		return res.json({ 
			response: botResponse,
			success: true 
		});

	} catch (error) {
		console.error('Chatbot error:', error);
		return res.status(500).json({ 
			msg: 'Chatbot service unavailable',
			success: false 
		});
	}
}

module.exports = { sendMessage };
