const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profiles');
const User = require('../../models/User');

//@route   GET api/profile/me
//@desc    Get current user's profile
//@access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

    if(!profile){
        return res.status(400).json({ msg: 'This Profile Doesn\'t Exist' })
    }

    res.json(profile);

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }    
});

//@route   Post api/profile
//@desc    Create/Update user profile
//@access  Private

router.post('/', [ auth, 
    [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills Required').not().isEmpty()
    ]],
     async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.status(400).json({ errors: errors.array() });
        }
        const { 
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            twitter,
            facebook,
            instagram,
            linkedin
        } = req.body;

        // Build Profile
        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        if(skills){
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // Build social fields object
        profileFields.social = {}
        if(youtube) profileFields.youtube = youtube;
        if(twitter) profileFields.twitter = twitter;
        if(facebook) profileFields.facebook = facebook;
        if(linkedin) profileFields.linkedin = linkedin;
        if(instagram) profileFields.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if(profile){
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    { $set: profileFields },
                    { new: true }
                    );

                    return res.json(profile);
            }
            
        // Create new profile if no profile is found

        profile = Profile(profileFields);
        await profile.save();
        res.json(profile);

        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }
     }
);

//@route   Get api/profile
//@desc    Get all user profile
//@access  Public
router.get('/', async (req,res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route   Get api/profile/user/:user_id
//@desc    Get profile by id
//@access  Public
router.get('/user/:user_id', async (req,res) => {
    try {
        const profile = await Profile.findOneAndUpdate({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if(!profile) 
        return res.status(400).json({ msg: 'User does not exist' });
        res.json(profile);
    } 
    catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Profile Doesn\'t Exist' });
        }
        res.status(500).send('Server Error');
    }
});

//@route   Delete api/profile
//@desc    Delete a user, a profile or post
//@access  Private
router.delete('/', auth, async (req,res) => {
    try {
        // To remove a profile
        await Profile.findOneAndRemove({ user: req.user.id });
        
        // To remove a user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User Removed Successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route   PUT api/profile/experience
//@desc    Add/Update profile experience
//@access  Private
router.put('/experience', [auth, [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty()
    ]
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } =  req.body;

    const newExperience = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExperience);
        await profile.save();
        res.json(profile)
    } 
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route   Delete api/profile/experience/:exp_id
//@desc    Delete profile experience
//@access  Private
router.delete('/experience/:exp_id', auth, async(req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get the index to remove
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        if(removeIndex == -1){
            return res.status(403).send('Entry Doesn\'t Exist');
        }

        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
);

//@route   PUT api/profile/education
//@desc    Add/Update profile education
//@access  Private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('major', 'Field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]
], async (req,res) => {
const errors = validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
}

const {
    school,
    degree,
    major,
    from,
    to,
    current,
    description
} =  req.body;

const newEducation = {
    school,
    degree,
    major,
    from,
    to,
    current,
    description
}

try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(newEducation);
    await profile.save();
    res.json(profile)
} 
catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
}
});

//@route   Delete api/profile/education/:edu_id
//@desc    Delete profile education
//@access  Private
router.delete('/education/:edu_id', auth, async(req,res) => {
try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get the index to remove
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
    if(removeIndex == -1){
        return res.status(403).send('Entry Doesn\'t Exist');
    }

    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);

} catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
}
}
);

//@route   Get api/profile/github/:username
//@desc    Get user's Github repos
//@access  Public
router.get('/github/:username', (req,res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_Secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };

        request(options, (error, response, body) => {
            if(error) console.error(error);

            if(response.statusCode !== 200){
                return res.status(404).json({ msg: 'Profile not found' })
            }
            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;